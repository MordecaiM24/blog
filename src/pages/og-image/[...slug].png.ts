import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";

const ogOptions: SatoriOptions = {
	// debug: true,
	fonts: [
		{
			data: Buffer.from(RobotoMono),
			name: "Roboto Mono",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(RobotoMonoBold),
			name: "Roboto Mono",
			style: "normal",
			weight: 700,
		},
	],
	height: 630,
	width: 1200,
};

const markup = (title: string, pubDate: string) =>
	html`<div tw="flex flex-col w-full h-full bg-[#1d1f21] text-[#c9cacc]">
		<div tw="flex flex-col flex-1 w-full p-10 justify-center">
			<p tw="text-2xl mb-6">${pubDate}</p>
			<h1 tw="text-6xl font-bold leading-snug text-white">${title}</h1>
		</div>
		<div tw="flex items-center justify-between w-full p-10 border-t border-[#2bbc89] text-xl">
			<div tw="flex items-center">
				<svg
          version="1.1"
          height="112"
          width="96"
          viewBox="0 0 96 112"
          class="diagram"
          text-anchor="middle"
          font-family="monospace"
          font-size="13px"
          stroke-linecap="round"
          id="svg51"
          sodipodi:docname="m.svg"
          inkscape:version="1.4.2 (ebf0e940, 2025-05-08)"
          xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
          xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:svg="http://www.w3.org/2000/svg">
          <defs
            id="defs51" />
          <sodipodi:namedview
            id="namedview51"
            pagecolor="#ffffff"
            bordercolor="#000000"
            borderopacity="0.25"
            inkscape:showpageshadow="2"
            inkscape:pageopacity="0.0"
            inkscape:pagecheckerboard="0"
            inkscape:deskcolor="#d1d1d1"
            inkscape:zoom="2.513408"
            inkscape:cx="39.587683"
            inkscape:cy="-21.882639"
            inkscape:window-width="1512"
            inkscape:window-height="945"
            inkscape:window-x="0"
            inkscape:window-y="37"
            inkscape:window-maximized="0"
            inkscape:current-layer="svg51" />
          <path
            d="M 26,64 L 26,80"
            fill="none"
            stroke="black"
            id="path1" />
          <path
            d="M 22,64 L 22,80"
            fill="none"
            stroke="black"
            id="path2" />
          <path
            d="M 90,32 L 90,80"
            fill="none"
            stroke="black"
            id="path3" />
          <path
            d="M 86,32 L 86,80"
            fill="none"
            stroke="black"
            id="path4" />
          <path
            id="rect4"
            class="gray"
            d="m 76,72 h 8 v 16 h -8 z" />
          <path
            id="rect5"
            class="gray"
            d="m 76,56 h 8 v 16 h -8 z" />
          <path
            id="rect6"
            class="gray"
            d="m 76,40 h 8 v 16 h -8 z" />
          <path
            id="rect7"
            class="gray"
            d="m 76,24 h 8 v 16 h -8 z" />
          <path
            id="rect8"
            class="gray"
            d="m 76,8 h 8 v 16 h -8 z" />
          <path
            id="rect9"
            class="gray"
            d="m 68,72 h 8 v 16 h -8 z" />
          <path
            id="rect10"
            class="gray"
            d="m 68,56 h 8 v 16 h -8 z" />
          <path
            id="rect11"
            class="gray"
            d="m 68,40 h 8 v 16 h -8 z" />
          <path
            id="rect12"
            class="gray"
            d="m 68,24 h 8 v 16 h -8 z" />
          <path
            id="rect13"
            class="gray"
            d="m 68,8 h 8 v 16 h -8 z" />
          <path
            id="rect14"
            class="gray"
            d="m 60,24 h 8 v 16 h -8 z" />
          <path
            id="rect15"
            class="gray"
            d="m 60,8 h 8 v 16 h -8 z" />
          <path
            id="rect16"
            class="gray"
            d="m 52,40 h 8 v 16 h -8 z" />
          <path
            id="rect17"
            class="gray"
            d="m 52,24 h 8 v 16 h -8 z" />
          <path
            id="rect18"
            class="gray"
            d="m 44,56 h 8 v 16 h -8 z" />
          <path
            id="rect19"
            class="gray"
            d="m 44,40 h 8 v 16 h -8 z" />
          <path
            id="rect20"
            class="gray"
            d="m 36,56 h 8 v 16 h -8 z" />
          <path
            id="rect21"
            class="gray"
            d="m 36,40 h 8 v 16 h -8 z" />
          <path
            id="rect22"
            class="gray"
            d="m 28,40 h 8 v 16 h -8 z" />
          <path
            id="rect23"
            class="gray"
            d="m 28,24 h 8 v 16 h -8 z" />
          <path
            id="rect24"
            class="gray"
            d="m 20,24 h 8 v 16 h -8 z" />
          <path
            id="rect25"
            class="gray"
            d="m 20,8 h 8 v 16 h -8 z" />
          <path
            id="rect26"
            class="gray"
            d="m 12,72 h 8 v 16 h -8 z" />
          <path
            id="rect27"
            class="gray"
            d="m 12,56 h 8 v 16 h -8 z" />
          <path
            id="rect28"
            class="gray"
            d="m 12,40 h 8 v 16 h -8 z" />
          <path
            id="rect29"
            class="gray"
            d="m 12,24 h 8 v 16 h -8 z" />
          <path
            id="rect30"
            class="gray"
            d="m 12,8 h 8 v 16 h -8 z" />
          <path
            id="rect31"
            class="gray"
            d="m 4,72 h 8 V 88 H 4 Z" />
          <path
            id="rect32"
            class="gray"
            d="m 4,56 h 8 V 72 H 4 Z" />
          <path
            id="rect33"
            class="gray"
            d="m 4,40 h 8 V 56 H 4 Z" />
          <path
            id="rect34"
            class="gray"
            d="m 4,24 h 8 V 40 H 4 Z" />
          <path
            id="rect35"
            class="gray"
            d="m 4,8 h 8 V 24 H 4 Z" />
          <g
            class="text"
            id="g51">
            <path
              d="M 31.508057,22.831055 H 30.52417 v -5.833496 h -2.424805 v -0.983887 h 3.408692 z m 0.983886,0 v -7.80127 h -4.392578 v -0.983887 h 5.376465 v 8.785157 z"
              id="text35"
              style="font-size:13px"
              aria-label="╗" />
            <path
              d="M 87.508057,22.831055 H 86.52417 v -5.833496 h -2.424805 v -0.983887 h 3.408692 z m 0.983886,0 v -7.80127 h -4.392578 v -0.983887 h 5.376465 v 8.785157 z"
              id="text36"
              style="font-size:13px"
              aria-label="╗" />
            <path
              d="M 39.508057,38.831055 H 38.52417 v -5.833496 h -2.424805 v -0.983887 h 3.408692 z m 0.983886,0 v -7.80127 h -4.392578 v -0.983887 h 5.376465 v 8.785157 z"
              id="text37"
              style="font-size:13px"
              aria-label="╗" />
            <path
              d="M 23.508057,54.831055 H 22.52417 v -8.785157 h 5.376465 v 0.983887 h -4.392578 z m 0.983886,0 v -6.817383 h 3.408692 v 0.983887 H 25.47583 v 5.833496 z"
              id="text38"
              style="font-size:13px"
              aria-label="╔" />
            <path
              d="M 63.508057,54.831055 H 62.52417 v -8.785157 h 5.376465 v 0.983887 h -4.392578 z m 0.983886,0 v -6.817383 h 3.408692 v 0.983887 H 65.47583 v 5.833496 z"
              id="text39"
              style="font-size:13px"
              aria-label="╔" />
            <path
              d="m 30.52417,64.997559 v -8.791504 h 0.983887 v 7.807617 h 4.392578 v 0.983887 z m 5.376465,-1.967774 h -3.408692 v -6.82373 h 0.983887 v 5.839843 h 2.424805 z"
              id="text40"
              style="font-size:13px"
              aria-label="╚" />
            <path
              d="M 55.508057,70.831055 H 54.52417 v -8.785157 h 5.376465 v 0.983887 h -4.392578 z m 0.983886,0 v -6.817383 h 3.408692 v 0.983887 H 57.47583 v 5.833496 z"
              id="text41"
              style="font-size:13px"
              aria-label="╔" />
            <path
              d="m 60.099365,64.013672 h 4.392578 v -7.807617 h 0.983887 v 8.791504 h -5.376465 z m 0,-0.983887 v -0.983887 h 2.424805 v -5.839843 h 0.983887 v 6.817382 z"
              id="text42"
              style="font-size:13px"
              aria-label="╝" />
            <path
              d="m 38.52417,80.997559 v -8.791504 h 0.983887 v 7.807617 h 4.392578 v 0.983887 z m 5.376465,-1.967774 h -3.408692 v -6.82373 h 0.983887 v 5.839843 h 2.424805 z"
              id="text43"
              style="font-size:13px"
              aria-label="╚" />
            <path
              d="m 44.099365,80.013672 h 7.80127 v 0.983887 h -7.80127 z m 0,-0.983887 v -0.983887 h 7.80127 v 0.983887 z"
              id="text44"
              style="font-size:13px"
              aria-label="═" />
            <path
              d="m 52.099365,80.013672 h 4.392578 v -7.807617 h 0.983887 v 8.791504 h -5.376465 z m 0,-0.983887 v -0.983887 h 2.424805 v -5.839843 h 0.983887 v 6.817382 z"
              id="text45"
              style="font-size:13px"
              aria-label="╝" />
            <path
              d="m 6.5241699,96.997559 v -8.791504 h 0.9838867 v 7.807617 h 4.3925784 v 0.983887 z M 11.900635,95.029785 H 8.4919434 v -6.82373 h 0.9838867 v 5.839843 h 2.4248049 z"
              id="text46"
              style="font-size:13px"
              aria-label="╚" />
            <path
              d="m 12.099365,96.013672 h 7.80127 v 0.983887 h -7.80127 z m 0,-0.983887 v -0.983887 h 7.80127 v 0.983887 z"
              id="text47"
              style="font-size:13px"
              aria-label="═" />
            <path
              d="m 20.099365,96.013672 h 4.392578 v -7.807617 h 0.983887 v 8.791504 h -5.376465 z m 0,-0.983887 v -0.983887 h 2.424805 v -5.839843 h 0.983887 v 6.817382 z"
              id="text48"
              style="font-size:13px"
              aria-label="╝" />
            <path
              d="m 70.52417,96.997559 v -8.791504 h 0.983887 v 7.807617 h 4.392578 v 0.983887 z m 5.376465,-1.967774 h -3.408692 v -6.82373 h 0.983887 v 5.839843 h 2.424805 z"
              id="text49"
              style="font-size:13px"
              aria-label="╚" />
            <path
              d="m 76.099365,96.013672 h 7.80127 v 0.983887 h -7.80127 z m 0,-0.983887 v -0.983887 h 7.80127 v 0.983887 z"
              id="text50"
              style="font-size:13px"
              aria-label="═" />
            <path
              d="m 84.099365,96.013672 h 4.392578 v -7.807617 h 0.983887 v 8.791504 h -5.376465 z m 0,-0.983887 v -0.983887 h 2.424805 v -5.839843 h 0.983887 v 6.817382 z"
              id="text51"
              style="font-size:13px"
              aria-label="╝" />
          </g>
        </svg>
				<p tw="ml-3 font-semibold">${siteConfig.title}</p>
			</div>
			<p>by ${siteConfig.author}</p>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(pubDate, {
		month: "long",
		weekday: "long",
	});
	const svg = await satori(markup(title, postDate), ogOptions);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));
}
