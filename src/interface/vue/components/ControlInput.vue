<script setup>
	import { computed, ref } from 'vue';


	const props = defineProps({
		inputType: {
			type: String,
			default: 'text',
		},
		label: {
			type: String,
			default: ''
		},
		placeholder: {
			type: String,
			default: '',
		},
		modelValue: {
			default: '',
		}
	});

	defineEmits([ 'update:modelValue' ]);

	const inputTypes = [ 'text', 'number', 'phone', 'email', 'checkbox' ];

	const validInputType = computed(() => {
		return inputTypes.includes(props.inputType)
			? props.inputType
			: 'text';
	});

	// const modelValue = ref();

</script>

<template>
	<input
		@input="$emit('update:modelValue', $event.target.value)"
		class="py-1 px-2 h-8 bg-input-bg text-input-text rounded focus:outline-none focus:outline-button-border focus:outline-[1px]"
		:value="modelValue"
	/>
</template>