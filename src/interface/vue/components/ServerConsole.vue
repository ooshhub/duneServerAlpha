<script setup>

const receiveServerMessage = (messageString) => {
	//
}

defineExpose({
	receiveServerMessage
});

</script>

<template>
	<div>
		<h3 class="text-lg">Server status</h3>
		<div class="bg-black w-[97%] my-4 text-console-text border-console-border border-2 mx-auto rounded console">
			<div class="relative overflow-y-scroll max-h-[19rem] min-h-[19rem]"></div>
			<div class="relative h-8 mx-auto grid grid-cols-[1.5rem_auto] items-center overflow-hidden w-[99%] border-t-[1px] border-console-separator self-center px-0">
				<div class="input-marker">></div>
				<input type="text"
					class="font-normal font-sm bg-black border-none overflow-hidden focus:outline-none"
					autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
			</div>
		</div>
	</div>
</template>

<style scoped>
	.console {
		box-shadow: 0px 0px 2px #06e206;
	}
	.server-log-line {
		text-align: left;
		padding: 0.25rem 0.5rem;
	}

	#server-log ::-webkit-scrollbar {
		width: 0.5rem;
	}

	#server-log	::-webkit-scrollbar-track {
		background: #001d00;
		border-radius: 5px;
	}

	#server-log	::-webkit-scrollbar-thumb {
		background: #036d03;
		border-radius: 5px;
	} 
</style>