<script setup>
import { ref } from 'vue';

	const props = defineProps({
		label: {
			type: String,
			default: 'New Button',
		},
		enabled: {
			type: Boolean,
			default: true,
		}
	});

</script>

<template>
	<div class="flex items-center justify-center px-4">
		<button 
			class="button-shadow appearance-none text-sm py-1 px-5 uppercase bg-button-bg border-button-border text-slate-900 rounded-sm cursor-pointer my-2 shadow"
			:class="{ 'text-button-text hover:text-button-text-active': enabled, 'text-button-text-disabled pointer-events-none': !enabled }"
			tabindex="-1"
			@click="$emit('clicked')"
		>
			{{ props.label }}
		</button>
	</div>
</template>

<style scoped>
	.button-shadow {
		box-shadow: 0 0 3px rgb(15 23 42);
	}
</style>
