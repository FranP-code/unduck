import { Bang } from "./bang.d";
import { bangs as defaultBangs } from "./bang";
import { bangs as customBangs } from "./custom-bang";
import "./global.css";
import fuzzysort from "fuzzysort";

function noSearchDefaultPageRender() {
	const app = document.querySelector<HTMLDivElement>("#app")!;
	app.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
      <div class="content-container">
        <h1>Und*ck</h1>
        <p>DuckDuckGo's bang redirects are too slow. Add the following URL as a custom search engine to your browser. Enables <a href="https://duckduckgo.com/bang.html" target="_blank">all of DuckDuckGo's bangs.</a></p>
        <div class="url-container"> 
          <input
						id="url-input"
            type="text" 
            class="url-input"
            value="${`${window.location.origin}/?q=%s`}"
            readonly 
          />
          <button class="copy-button">
            <img src="/clipboard.svg" alt="Copy" />
          </button>
        </div>
				<div>
					<input
						id="bang-search"
						type="text"
						placeholder="Search for a bang"
						class="url-input"
					/>
					<div class="bang-list">
					</div>
				</div>
      </div>
      <footer class="footer">
        <a href="https://t3.chat" target="_blank">t3.chat</a>
        •
        <a href="https://x.com/theo" target="_blank">theo</a>
        •
        <a href="https://github.com/t3dotgg/unduck" target="_blank">github</a>
      </footer>
    </div>
  `;

	const copyButton = app.querySelector<HTMLButtonElement>(".copy-button")!;
	const copyIcon = copyButton.querySelector("img")!;
	const urlInput = app.querySelector<HTMLInputElement>("#url-input")!;

	const bangInput = app.querySelector<HTMLInputElement>("#bang-search")!;
	const bangList = app.querySelector<HTMLDivElement>(".bang-list")!;

	copyButton.addEventListener("click", async () => {
		await navigator.clipboard.writeText(urlInput.value);
		copyIcon.src = "/clipboard-check.svg";

		setTimeout(() => {
			copyIcon.src = "/clipboard.svg";
		}, 2000);
	});

	// Wait for user to stop typing for 300ms
	let timeout: number;
	bangInput.addEventListener("keyup", (e) => {
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(() => {
			const searchTerm = (e.target as HTMLInputElement).value;
			if (!searchTerm) {
				bangList.innerHTML = "";
				return;
			}

			const results = fuzzysort
				.go(searchTerm, bangs, {
					keys: ["d", "s"],
				})
				.map((result) => result.obj);

			bangList.innerHTML = results
				.map((bang: Bang) => {
					return `<div class="bang-item">
						<span class="bang-name">!${bang.t}</span>
						<span class="bang-description">${bang.d}</span>
					</div>`;
				})
				.join("");
		}, 300);
	});
}

const bangs = [
	...defaultBangs.filter((bang) => !customBangs.some((c) => c.t === bang.t)),
	...customBangs,
];

const LS_DEFAULT_BANG = localStorage.getItem("default-bang") ?? "g";
const defaultBang = bangs.find((b) => b.t === LS_DEFAULT_BANG);

function getBangredirectUrl() {
	const url = new URL(window.location.href);
	const query = url.searchParams.get("q")?.trim() ?? "";
	if (!query) {
		noSearchDefaultPageRender();
		return null;
	}

	const match = query.match(/!(\S+)/i);

	const bangCandidate = match?.[1]?.toLowerCase();
	const selectedBang = bangs.find((b) => b.t === bangCandidate) ?? defaultBang;

	// Remove the first bang from the query
	const cleanQuery = query.replace(/!\S+\s*/i, "").trim();

	// Format of the url is:
	// https://www.google.com/search?q={{{s}}}
	const searchUrl = selectedBang?.u.replace(
		"{{{s}}}",
		// Replace %2F with / to fix formats like "!ghr+t3dotgg/unduck"
		encodeURIComponent(cleanQuery).replace(/%2F/g, "/")
	);
	if (!searchUrl) return null;

	return searchUrl;
}

function doRedirect() {
	const searchUrl = getBangredirectUrl();
	if (!searchUrl) return;
	window.location.replace(searchUrl);
}

doRedirect();
