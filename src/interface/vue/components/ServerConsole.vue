<script setup>
	import { nextTick, ref } from 'vue';
	import CommandInput from './CommandInput.vue';
	import LogLine from './LogLine.vue';

	const maxLogSize = 200;
	const maxScrollSnapping = 150;

	const receiveServerMessage = async (messageString) => {
		console.log(`Received message:`, messageString);
		messageLog.value.length >= maxLogSize
			? messageLog.value = [ ...messageLog.value.slice((messageLog.value.length - (maxLogSize - 1))), messageString ]
			: messageLog.value.push(messageString);
		await nextTick().then(() => {
			if (!logContainer.value.value) return;
			const scrollDistance = logContainer.value.scrollHeight - (logContainer.value.scrollTop + logContainer.value.offsetHeight);
			if (scrollDistance < maxScrollSnapping) {
				logContainer.value.scrollTop = logContainer.value.scrollHeight;
			}
		});
	}

	let counter = 0;
	const getCounter = () => counter ++; 

	const messageLog = ref([]);
	const logContainer = ref(null);

	defineExpose({
		receiveServerMessage
	});

	const emit = defineEmits([
		'emitCommand'
	]);

</script>

<template>
	<div>
		<h3 class="text-lg">Server status</h3>
		<div class="bg-black w-[97%] my-4 text-console-text border-console-border border-2 mx-auto rounded console">
			<div ref="logContainer" class="relative overflow-y-scroll max-h-[19rem] min-h-[19rem]">
				<LogLine v-for="line in messageLog" :key="getCounter(line)"
					:message="`${line}`"
				/>
			</div>
			<div class="relative h-8 mx-auto grid grid-cols-[1.5rem_auto] items-center overflow-hidden w-[99%] border-t-[1px] border-console-separator self-center px-0">
				<div class="input-marker">></div>
				<CommandInput 
					@emit-command="(...args) => emit('emitCommand', ...args)"
				/>
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

</style>