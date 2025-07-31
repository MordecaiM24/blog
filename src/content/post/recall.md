---
title: "Recall Breakdown"
description: "A breakdown of creating the Recall mobile app"
publishDate: "05 July 2025"
updatedDate: "31 July 2025"
tags: ["ai", "mobile", "search"]
---

## Building a Personal AI That Actually Works: Lessons from Going Full Offline

*How I built a semantic search system that runs entirely on your phone, and why it's harder than you think*

Language models are everywhere, but they're all in the cloud. Your documents, messages, and personal data get shipped off to someone else's servers every time you want to search through them. For most people, this feels wrong. Your thoughts shouldn't need an internet connection.

So I built something different: a personal knowledge base that runs entirely offline, with semantic search powered by a local language model. No data leaves your machine. No monthly subscriptions. No "sorry, our servers are down" messages when you need to find that important email from six months ago.

Turns out, making AI work well offline is a little harder than it sounds.

## Why Offline Matters (and Why It's Hard)

Privacy is the obvious reason to go offline, but it's not the only one. Latency matters too. When you're searching through your own data, you want results instantly, not after a round trip to Virginia. Cost is another factor. Inference costs add up fast, and not all of us have VC's letting us burn money!

But offline AI is a little harder than what you can do in the cloud. Cloud providers have massive GPUs, infinite RAM, and teams of engineers optimizing inference. On a laptop, you're working with 16GB of shared memory. On a phone, you don't even have that.

The constraints are real, but they force you to make better architectural decisions. Every inefficiency becomes visible when you can't just throw more cloud resources at the problem.

## System Architecture

The architecture splits the classic "embed, store, retrieve, synthesize" pipeline into discrete services that can be optimized independently:

- **ContentService**: The orchestrator that handles all CRUD operations and coordinates between other services
- **SQLiteService**: Persistence layer using SQLite with the sqlite-vec extension for vector operations
- **EmbeddingService**: Wraps a local BERT model for text-to-vector conversion
- **Foundation Models integration**: Uses Apple's on-device LLMs for synthesis and tool calling

The key insight is treating embeddings and raw content as separate concerns. Documents (whether it's your emails, messages, etc) are stored in one table, with their combinations and searchable chunks stored separately, allowing us to optimize each for their specific use cases.

## Data Ingestion

Real personal data is messy. Email threads span months and contain attachments, signatures, and reply chains. Message conversations include group chats where context matters. Note-taking apps have their own hierarchies and metadata.

The unified Item abstraction is what's used to represent any content type while preserving their type-specific metadata:


```swift
struct Item {
    let id: String
    let type: ContentType  // document, email, message, note
    let title: String
    let content: String
    let embeddableText: String  // optimized for search
    let snippet: String        // optimized for display
    var threadId: String       // groups related items
    let date: Date
    let metadata: [String: Any]  // type-specific fields
}
```

The Thread concept groups related items together, whether it's email chains, message conversations, or document versions. This mirrors how humans actually think about information. Rather than isolated snippets (chunks), these are full threads stored over time.

## Embedding Strategies

Before we get into the algorithms, let's take a minute to talk about CoreML. CoreML uses something called a static graph internally to optimize the speed at which it can perform ML operations. A static graph allows CoreML to take a single hyperoptimized route from input to output, which is why you can run an embedding model or an LLM on your phone. It's *fantastic* for performance, users, and efficency. However, it's a little less fun for developers. That static graph in this case means the input sequence length has to be predetermined at compile time. 

The model we're using, a port of a all-MiniLM-L6-v2, expects exactly 512 tokens, padded or truncated to fit. Attention masks tell the model which tokens are real versus padding. And the tokenization has to match the training process exactly, down to the wordpiece splitting algorithm.

```swift
func encode(text: String, maxLength: Int = 512) throws -> TokenizationResult {
    let tokens = tokenize(text: text)
    let withSpecials = ["[CLS]"] + tokens + ["[SEP]"]
    let truncated = Array(withSpecials.prefix(maxLength))
    let tokenIds = truncated.map { vocab[$0] ?? vocab["[UNK]"]! }
    
    let realTokenCount = tokenIds.count
    let attentionMask = Array(repeating: 1, count: realTokenCount) + 
                       Array(repeating: 0, count: maxLength - realTokenCount)
    let paddedIds = tokenIds + Array(repeating: 0, count: maxLength - realTokenCount)
    
    return TokenizationResult(inputIds: paddedIds, attentionMask: attentionMask)
}
```

But here's the problem: 512 tokens is roughly 300-400 words. Most documents are longer than that. Email threads can be thousands of words. And messages have the opposite problem - they're minuscule. How do you search through your life when the machine only sees independent 512 token chunks?

## Threading

The solution is chunking with overlap. Messages and emails are taken as parts of a whole, rather than just parts. This means that we take all emails in a thread, combine them into a longer "thread", a single string with demarcations of the boundaries of different documents (e.g., for messages, this marks >1 day differences in time sent), and using this as our content that we use a sliding window over. From there, we split the thread into ThreadChunks (with references in each chunk to the original document source(s) that it came from), embed each chunk separately, and use that as the basis for our search algorithm. This referential integrity also allows for context reconstruction during retrieval (a feature made much more useful with tool calling). 

```swift
func createThreadChunks(from thread: Thread, config: ChunkingConfig) async throws -> [ThreadChunk] {
    let allTokens = tokenizer.tokenize(text: thread.content)
    var chunks: [ThreadChunk] = []
    var startTokenIndex = 0
    
    while startTokenIndex < allTokens.count {
        let endTokenIndex = min(startTokenIndex + config.windowSize, allTokens.count)
        let chunkTokens = Array(allTokens[startTokenIndex..<endTokenIndex])
        let chunkText = reconstructTextFromTokens(chunkTokens)
        let embedding = try await embed(text: chunkText)
        
        let chunk = ThreadChunk(
            threadId: thread.id,
            parentIds: thread.itemIds,
            type: thread.type,
            content: chunkText,
            embedding: embedding,
            chunkIndex: chunks.count,
            startPosition: calculateStartPosition(...),
            endPosition: calculateEndPosition(...)
        )
        
        chunks.append(chunk)
        let stepSize = config.windowSize - config.overlapSize
        startTokenIndex += stepSize
    }
    
    return chunks
}
```

Each chunk knows its position in the original document, so the relevant section can be highlighted while still providing full thread context. It's a compromise, but it works surprisingly well in practice.

## Storage

SQLite is already deployed in (almost) every app on your phone and computer. According to [SQLite's official website](https://www.sqlite.org/mostdeployed.html), there are over 1 *trillion* deployments of SQLite worldwide. However, most of the ones (at least on iOS) aren't wrangling pointers like this. Apple's [CoreData](https://developer.apple.com/documentation/coredata) library is most developer's tool of choice for persistent local storage, even if it does use SQLite under the hood. Still, SQLite's advantages of having everything in a single file that we can backup, version, and debug, without managing a separate vector db, makes it the right choice here.

However, Swift's existing SQLite wrappers, even those outside of CoreData like SQLite.swift and FMDB, focus on traditional relational operations. They don't handle the mix of structured data, binary blobs, and custom extensions that we need. So, I built a wrapper directly on top of the C API (pointer's and all). 

THe core challenge is managing statement preparation and execution across multiple content types while maintaining type safety (as much as you can while dealing with raw C in Swift). Anyway, this ended up with a pattern where each operation gets its own prepared statement that's reused across calls, e.g.:

```swift
func insertThreadChunks(_ threadChunks: [ThreadChunk]) throws -> [String] {
    return try sync {
        let sql = """
            INSERT INTO Chunk (id, thread_id, parent_ids, type, content, chunk_index, startPosition, endPosition, embedding)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, vec_f32(?));
        """
        var stmt: OpaquePointer?
        try beginTransaction()
        defer { sqlite3_finalize(stmt) }
        
        guard sqlite3_prepare_v2(dbPointer, sql, -1, &stmt, nil) == SQLITE_OK else {
            throw SQLiteError.prepare(message: errorMessage)
        }
    }
}
```

The sync wrapper ensures all database write operations happen on a serial queue (SQLite supports concurrent reads but writes have to be serialized). This was learned the hard way after several mysterious corruption issues and race conditions in early versions. 

Memory management isn't normally something that Swift devs worry about, but it is actually quite critical with raw SQLite (and batch importing and thousands of prepared statements). SQLite holds onto memory until statements are finalized, and iOS will kill your app if you're not careful. The wrapper ensures that every sqlite3_prepare_v2 has a matching sqlite3_finalize.

## Vector Storage (Specifically)

As easy as building that custom SQLite wrapper and managing pointers was (hint: it wasn't), the sqlite-vec integration was harder. The extension is written in C (as you would expect from a SQLite extension) and its iOS compilations ended up being more complex than just dropping in the C and letting XCode figure it out.

First, the bridging headers. sqlite-vec needs to be compiled into the app directly, and linked statically into the extension, as you can see:

```swift
// Briding
int sqlite3_vec_init(sqlite3 *db, char **pzErrMsg, const sqlite3_api_routines *pApi);
```
```swift
// Initializing
if sqlite3_vec_init(db, nil, nil) != SQLITE_OK {
    let msg = String(cString: sqlite3_errmsg(db))
    throw SQLiteError.initExtension(message: msg)
}
```

Some added complexity comes from vector serialization. sqlite-vec expects 32-bit floats as binary blobs in little-endian format. Swift's [Float] arrays (which is what our CoreML model outputs) can't be passed directly. They need to be converted byte by byte, as you can see below:

```swift
private func embeddingToBlob(_ embedding: [Float]) -> [UInt8] {
    var blob = [UInt8]()
    blob.reserveCapacity(embedding.count * 4)
    
    for value in embedding {
        let bits = value.bitPattern
        blob.append(UInt8(bits & 0xFF))
        blob.append(UInt8((bits >> 8) & 0xFF))
        blob.append(UInt8((bits >> 16) & 0xFF))
        blob.append(UInt8((bits >> 24) & 0xFF))
    }
    
    return blob
}
```

And the reverse operation for reading vectors back:
```swift
private func blobToEmbedding(_ blob: UnsafeRawPointer?, count: Int) -> [Float] {
        guard let blob = blob else { return [] }
        var floats = [Float](repeating: 0, count: count)
        let pointer = blob.assumingMemoryBound(to: UInt8.self)
        for i in 0..<count {
            let base = pointer + (i * 4)
            let value = base.withMemoryRebound(to: UInt32.self, capacity: 1) { $0.pointee }
            floats[i] = Float(bitPattern: value)
        }
        return floats
    }
```

I also needed to write some custom binding code since Swift's SQLite wrappers don't handle binary blob parameters well:

```swift
let vectorBlob = embeddingToBlob(chunk.embedding)
guard sqlite3_bind_blob(stmt, 9, vectorBlob, Int32(vectorBlob.count), nil) == SQLITE_OK else {
    throw SQLiteError.bind(message: errorMessage)
}
```


## Synthesis and Tool Calling

The real magic happens when you connect local search to a language model. Apple's Foundation Models API provides tool calling support, so I can give the LLM access to our search functionality:

```swift
@Observable
class SemanticSearchTool: Tool {
    let name = "semanticSearch"
    let description = "search through documents, emails, messages, and notes using semantic similarity"
    
    func call(arguments: Arguments) async throws -> ToolOutput {
        let results = try await contentService.search(arguments.query, limit: 10)
        
        guard !results.isEmpty else {
            return ToolOutput("no results found for: '\(arguments.query)'")
        }
        
        let formattedResults = results.enumerated().map { index, result in
            """
            [\(index + 1)]: \(result.thread.snippet)
            content: \(result.items.first?.content.prefix(150) ?? "")...
            thread id: \(result.thread.id)
            """
        }.joined(separator: "\n\n")
        
        return ToolOutput(formattedResults)
    }
}
```

The LLM can now search through your data, analyze the results, and provide synthesized answers. AKA, your personal research assistant that can look through everything you've ever written or received. 

The threading that we mentioned earlier also becomes very useful here. Apple's on device models have a hard context limit of 4096 tokens. This isn't *nothing*, but for multi turn conversations with the context we're adding with our search and synthesis, this adds up quick. Having thread chunks as our search items allows the LLM to see the beginning of a thread and the associated items that were returned, and from there, only expand context when it actually finds what it needs.


## Lessons Learned

Building offline AI forced us to confront the fundamental tradeoffs between convenience and privacy, cloud scale and local constraints. The result is a system that feels different from cloud AI—more intimate, more responsive, but also more limited in scope.

The architecture patterns developed (chunked embeddings, thread reconstruction, tool-calling with local search) seem generalizable beyond personal knowledge bases. Any application that needs to make AI work well with large amounts of personal data faces similar challenges.

The future of personal AI probably isn't choosing between cloud and local, but hybrid approaches that keep sensitive data local while leveraging cloud resources for computation that truly benefits from scale. But building local first taught us what's actually possible when you control the full stack.

---

*The complete source code for this project will be available soon on [Github](https://github.com/MordecaiM24).*