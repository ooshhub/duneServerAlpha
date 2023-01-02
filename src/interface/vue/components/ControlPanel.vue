<script setup>
	import { ref } from 'vue';
	import ControlButton from './ControlButton.vue';
	import ControlInput from './ControlInput.vue';

	const props = defineProps({
	});

	const data = {
		port: 3333,
		echoText: '',
	};

	const startServer = () => {
		alert(`Starting Server on port ${data.port}`);
	}

	const killServer = () => {
		alert('Killing Server');
	}

	const restartServer = () => {
		alert('Restarting server');
	}

	const echoServer = () => {
		alert('Echo server');
	}

</script>

<template>
	<div>
		<div class="flex justify-center items-center">
			<ControlButton label="Start Server" @clicked="startServer" />
			<ControlInput label="Port" v-model="data.port" />
		</div>
		<div>
			<ControlButton label="Kill Server" @clicked="killServer" />
		</div>
		<div class="flex justify-center items-center">
			<ControlButton class="inline-block" label="Echo Server" @clicked="echoServer" />
			<ControlInput class="inline-block" label="Echo: " v-model="data.echoText" />
		</div>
		<div>
			<ControlButton label="Restart Server" @clicked="restartServer" />
		</div>
	</div>
</template>	