<script setup>
	import ControlPanel from './components/ControlPanel.vue';
	import ServerConsole from './components/ServerConsole.vue';

	
</script>

<template>
	<div class="text-center font-mono text-[18px] h-full bg-deadspace">
		<div class="bg-main-bg w-[95%] py-4 my-4 border-main-border border-[1px] rounded mx-auto">
			<h1 class="text-2xl">Dune Server Alpha</h1>
			<h1 class="text-lg">Dev Interface <span id="version"></span></h1>
		</div>
		<ControlPanel class="mx-auto grid grid-cols-2 items-center justify-between bg-main-bg w-[95%] py-4 my-4 border-main-border border-[1px] rounded" />
		<ServerConsole class="bg-main-bg w-[95%] py-4 my-4 border-main-border border-[1px] rounded mx-auto" />
	</div>
</template>