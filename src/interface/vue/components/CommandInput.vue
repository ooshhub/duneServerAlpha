<script setup>
	import { ref } from 'vue';

	const currentInput = ref('');

	const submitCommand = () => {
		const [ , command, data ] = currentInput.value.match(/([\w_-]+)\s*(.*)/);
		const request = aliases[command.toLowerCase()];
		if (request) {
			emit('emitCommand', request, { 'data': data });
		}
		else {
			// Send message about bad alias
		}
		clearCommand();
	}

	const clearCommand = () => {
		currentInput.value = '';
	}

	const emit = defineEmits([
		'emitCommand'
	]);

	const aliases = {
		'echo': 'REQUEST_ECHO'
	}

</script>

<template>
	<input type="text"
		ref="inputElement"
		class="font-normal font-sm bg-black border-none overflow-hidden focus:outline-none"
		autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
		v-model="currentInput"
		@keyup.enter="submitCommand"
		@keyup.esc="clearCommand"	
	/>
</template>

<style scoped>

	::-webkit-scrollbar {
		width: 0.5rem;
	}

	::-webkit-scrollbar-track {
		background: #001d00;
		border-radius: 5px;
	}

	::-webkit-scrollbar-thumb {
		background: #036d03;
		border-radius: 5px;
	} 
</style>