import si from "systeminformation";
import fs from "fs/promises";

const getSensorInfo = async () => {
	const temp = si.cpuTemperature();
	const load = si.currentLoad();
	const mem = si.mem();
	const inetLatency = si.inetLatency();
	return {
		time: Date.now(),
		cpuTemp: (await temp).main,
		cpuLoad: (await load).currentLoad,
		...(await load).cpus.reduce((cpus, cpu, cpuIdx) => {
			cpus[`cpu${cpuIdx}Load`] = cpu.load;
			return cpus;
		}, {} as Record<string, number>),
		memTotal: (await mem).total,
		memUsed: (await mem).used,
		memActive: (await mem).active,
		swapUsed: (await mem).swapused,
		inetLatency: await inetLatency
	};
}

;(async () => {
	const logFile = `./${Date.now()}.csv`;

	await fs.writeFile(logFile, Object.keys(await getSensorInfo()).join(",")+"\n");
	setInterval(async () => {
		const sensorInfo = await getSensorInfo();
		console.log(sensorInfo);
		await fs.appendFile(logFile, Object.values(sensorInfo).join(",")+"\n");
	}, 1000);
})();