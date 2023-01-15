<script setup>

	const props = defineProps({
		message: {
			type: String,
			default: ''
		},
	});

</script>

<template>
	<div class="text-left px-2 py-1">
		{{  props.message }}
	</div>
</template>

