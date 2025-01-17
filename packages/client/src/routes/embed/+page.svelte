<script>
	// @ts-nocheck
	import { onMount } from 'svelte';

	onMount(() => {
		const id = new URL(window.location.href).searchParams.get('id');
		if (!id) {
			return;
		}

		const myPlayer = videojs('player');
		// TODO: the key should be generated on the client following the steps in the readme
		myPlayer.src({
			type: 'video/mp4',
			src: `http://localhost:3000/stream?id=${id}&k=pD67BNg3j92RY3NgRIiyWCtmMJgld9w%2BLD3UkJxiOJ%2B4kj3z4tvkFMyXPgl0wUb%2B`
		});
	});
</script>

<svelte:head>
	<link href="https://vjs.zencdn.net/8.16.1/video-js.css" rel="stylesheet" />
	<script src="https://vjs.zencdn.net/8.16.1/video.min.js"></script>
</svelte:head>

<main style="width: 100vw; height: 100vh; padding: 0; margin: 0;">
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		id="player"
		class="video-js"
		controls
		preload="auto"
		data-setup={{}}
		style="width: 100%; height: 100%;"
	>
		<p class="vjs-no-js">
			To view this video please enable JavaScript, and consider upgrading to a web browser that
			<a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
		</p>
	</video>

	<script src="https://vjs.zencdn.net/8.16.1/video.min.js"></script>
</main>
