<script setup>
import { ref } from 'vue';

	const props = defineProps({
		label: {
			type: String,
			default: 'New Button',
		},
	});

</script>

<template>
	<div class="flex items-center justify-center px-4">
		<button 
			class="appearance-none text-sm py-1 px-5 uppercase bg-button-bg border-button-border text-button-text rounded-sm cursor-pointer my-2 shadow
				hover:text-white"
				tabindex="-1"
				@click="$emit('clicked')"
			>
			{{ props.label }}
		</button>
	</div>
</template>
