<script setup>
	import ControlPanel from './components/ControlPanel.vue';
	import ServerConsole from './components/ServerConsole.vue';
	import { ServerInterface } from '../js/ServerInterface.js';
	import { ref } from 'vue';
	import { StdIoEvents, StdIoLogEvents, StdIoRequests, StdIoResponseMapping } from '../../server/events/mapping/StdIoEventMapping.js';

	const serverObserver = (interfaceEvent) => {
		const { eventName, eventData } = interfaceEvent;
		switch(eventName) {
			case(StdIoLogEvents.INTERFACE): {
				sendToInterfaceLog(eventData);
				break;
			}
			case(StdIoRequests.REQUEST_ECHO): {
				console.warn(eventData);
				sendToInterfaceLog(eventData);
				break;
			}
			case('EXIT'): {
				data.serverOnline = false;
				sendToInterfaceLog({ data: 'The server has closed unexpectedly.' });
				break;
			}
			case(StdIoEvents.UPDATE_ERROR): {
				console.error(eventData);
				sendToInterfaceLog({ data: 'Server error logged to console.' });
				break;
			}
			case(StdIoResponseMapping[StdIoRequests.REQUEST_RESTART]): {
				serverInterface.restartServer(eventData);
				break;
			}
			case(StdIoRequests.RESPONSE_STATUS || StdIoEvents.UPDATE_STATUS): {
				console.log('Status updated recceived');
				break;
			}
			case(StdIoRequests.RESPONSE_CLIENTS || StdIoEvents.UPDATE_CLIENTS): {
				console.log('Client update recieved');
				break;
			}
			default: {
				console.warn(`Unknown event sent by ServerInterface: "${eventName}"`);
			}
		}
	}

	const serverInterface = new ServerInterface({
		serverFilePath: './build/server/main.js',
		observer: serverObserver
	});

	const data = {
		serverOnline: ref(false),
	}

	const startServer = async (portNumber) => {
		console.log('Starting server...');
		await serverInterface.spawnServer(portNumber).catch(err => {
			alert('There was an error starting the server');
			console.error(err);
		}).finally(() => {
			data.serverOnline.value = serverInterface.online;
		});
	}

	const restartServer = async () => {
		serverInterface.sendRequestToServer(StdIoRequests.REQUEST_RESTART);
	}

	const killServer = async () => {
		return false;
	}

	const echoServer = async (message) => {
		serverInterface.sendRequestToServer(StdIoRequests.REQUEST_ECHO, message);
	}

	const interfaceLog = ref(null);

	const sendToInterfaceLog = (message) => {
		// console.info('Sending message to interface console');
		if (interfaceLog.value) interfaceLog.value.receiveServerMessage(message.data);
	}

	const sendServerCommand = (commandString, commandData) => {
		serverInterface.sendRequestToServer(commandString, commandData);
	}


</script>

<template>
	<div class="text-center font-mono text-[18px] h-full bg-deadspace">
		<div class="bg-main-bg w-[95%] py-4 my-4 border-main-border border-[1px] rounded mx-auto">
			<h1 class="text-2xl">Dune Server Alpha</h1>
			<h1 class="text-lg">Dev Interface <span id="version"></span></h1>
		</div>
		<ControlPanel 
			class="mx-auto grid grid-cols-2 items-center justify-between bg-main-bg w-[95%] py-4 my-4 border-main-border border-[1px] rounded"
			:server-online="data.serverOnline.value"
			@start-server="startServer"
			@restart-server="restartServer"
			@kill-server="killServer"
			@echo-server="echoServer"
		/>
		<ServerConsole ref="interfaceLog"
			class="bg-main-bg w-[95%] py-4 my-4 border-main-border border-[1px] rounded mx-auto" 
			@emit-command="(...args) => sendServerCommand(...args)"
		/>
	</div>
</template>