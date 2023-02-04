<script setup>
	import { ref } from 'vue';
	import ControlButton from './ControlButton.vue';
	import ControlInput from './ControlInput.vue';

	const props = defineProps({
		serverOnline: {
			type: Boolean,
			default: false,
		},
	});

	const emit = defineEmits([
		'startServer',
		'restartServer',
		'killServer',
		'echoServer',
	]);

	const data = {
		port: ref('3333'),
		echoText: ref(''),
	};

	const startServer = () => {
		emit('startServer', data.port.value);
	}

	const killServer = () => {
		emit('killServer');
	}

	const restartServer = () => {
		emit('restartServer');
	}

	const echoServer = () => {
		emit('echoServer', data.echoText.value);
		data.echoText.value = ''
	}

</script>

<template>
	<div>
		<div class="flex justify-center items-center">
			<ControlButton label="Start Server"
				@clicked="startServer"
				:enabled="!props.serverOnline"
			/>
			<ControlInput label="Port" v-model="data.port.value" />
		</div>
		<div>
			<ControlButton label="Kill Server"
				@clicked="killServer"
				:enabled="props.serverOnline"	
			/>
		</div>
		<div class="flex justify-center items-center">
			<ControlButton class="inline-block" label="Echo Server"
				@clicked="echoServer"
				:enabled="!!props.serverOnline && !!data.echoText.value"	
			/>
			<ControlInput class="inline-block" label="Echo: " v-model="data.echoText.value" />
		</div>
		<div>
			<ControlButton label="Restart Server"
				@clicked="restartServer"
				:enabled="props.serverOnline"
			/>
		</div>
	</div>
</template>	