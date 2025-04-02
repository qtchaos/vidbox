<script lang="ts">
	// @ts-nocheck
	import { onMount } from 'svelte';

	onMount(async () => {
		// Get the IMDB Id from the URL to pass onto the player
		const id = new URL(window.location.href).searchParams.get('id');
		if (!id) {
			return;
		}

		// Wait for the stream key to be set on the page
		const html = document.querySelector('html');
		let key = html?.accessKey;
		while (!key) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			key = html?.accessKey;
		}

		const player = videojs('player');
		const apiUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
		player.src({
			type: 'video/mp4',
			src: `${apiUrl}/stream?id=${id}&k=${key}`
		});

		while (true) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
			debugger;
		}
	});
</script>

<svelte:head>
	<link href="https://vjs.zencdn.net/8.16.1/video-js.css" rel="stylesheet" />
	<script type="text/javascript" src="https://vjs.zencdn.net/8.16.1/video.min.js"></script>
	<script type="module" src="./FaviconLoader.sys.mjs"></script>
	<script
		type="text/javascript"
		src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js"
	></script>
</svelte:head>

<main style="width: 100vw; height: 100vh; padding: 0; margin: 0;">
	<!-- svelte-ignore a11y_media_has_caption -->
	<video id="player" class="video-js" controls preload="auto" style="width: 100%; height: 100%;">
		<p class="vjs-no-js">
			To view this video please enable JavaScript, and consider upgrading to a web browser that
			<a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
		</p>
	</video>

	<script src="https://vjs.zencdn.net/8.16.1/video.min.js"></script>
</main>
