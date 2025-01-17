<script lang="ts">
	let id: string = '1254207';

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
		<span class="text-base font-medium text-dove mt-auto mb-auto">Contact</span>
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
