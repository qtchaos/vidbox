<script lang="ts">
	import { onMount } from 'svelte';

	let id: string = '1254207';

	onMount(() => {
		id = '1254207';
	});

	// TODO: current implementation doesnt allow shortcuts like Ctrl-X and Ctrl-Z which is a bit annoying
	function handleKeyDown(event: KeyboardEvent) {
		if (isNaN(Number(event.key)) && event.key !== 'Backspace') {
			event.preventDefault();
		}
	}
</script>

<div class="h-screen w-screen flex flex-col">
	<nav>
		<span>VidBox</span>
		<div class="flex flex-row gap-x-16">
			<a class="text-base font-medium text-dove mt-auto mb-auto" href="#contact">Contact</a>
			<a class="text-base font-medium text-dove mt-auto mb-auto" href="#api">API</a>
			<a class="text-base font-medium text-dove mt-auto mb-auto" href="#pricing">Pricing</a>
		</div>
	</nav>
	<main>
		<h1 class="text-6xl text-center leading-tight">
			<span class="header-gradient">Video Streaming Embed</span>
			<br />
			<span>With No Ads</span>
		</h1>
		<h2 class="text-dove text-center pb-8 mt-2">
			<span class="font-bold">VidBox</span> provides the best movie streaming experience,<br />
			making sailing the seas a breeze.
		</h2>
		<div class="w-full justify-center flex flex-col items-center gap-y-4 mt-4">
			<input
				type="text"
				placeholder="IMDb ID"
				minlength="1"
				maxlength="7"
				on:keydown={handleKeyDown}
				bind:value={id}
			/>
			<div class="w-[80%] text-center flex flex-col items-center justify-center">
				<iframe src="/embed?id={id}" width="640" height="360" frameborder="0" title="VidBox"
				></iframe>
			</div>
		</div>
	</main>
</div>
<div class="h-screen w-screen flex flex-col p-24 bg-bunker gap-y-24">
	<div>
		<h2 class="text-5xl pb-4 mt-2" id="pricing">∣ Pricing</h2>
		<p class="text-xl">
			In order to keep the service ad free for your users, you are required to pay a monthly fee of
			$9.99 USD as the site master.
		</p>
		<div class="text-xl border-2 border-dove rounded-xl p-4 mt-8 w-fit">
			By default you are accessing a trial API which limits the lifespan of the stream key to 10
			seconds from the time of generation.
		</div>
	</div>
	<div>
		<h2 class="text-5xl pb-4 mt-2" id="contact">∣ Contact</h2>
		<p class="text-xl">
			You can get in touch by sending an email to <a
				href="mailto:contact@vidbox.app"
				class="header-gradient">contact@vidbox.app</a
			>
		</p>
	</div>
	<div>
		<h2 class="text-5xl pb-4 mt-2" id="api">∣ API</h2>
		<p class="text-xl">Embed the video stream on your own page using the following HTML snippet:</p>
		<br />
		<!-- prettier-ignore -->
		<pre class="text-sm "><code class="language-html">&lt;iframe src="<span class="header-gradient">https://vidbox.app/embed?id=1254207</span>" title="VidBox"&gt;&lt;/iframe&gt;</code></pre>
	</div>
</div>
