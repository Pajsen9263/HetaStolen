<script lang="ts">
	interface Props {
		/** Total duration in seconds */
		duration?: number;
		/** End timestamp in milliseconds - set to start timer, clear to reset */
		endTimestamp?: number | null;
		/** Stroke width of the progress ring (in viewBox units) */
		strokeWidth?: number;
		/** Called when timer reaches 0 */
		onEnd?: () => void;
		/** Called each tick with remaining seconds */
		onTick?: (remaining: number) => void;
		/** Additional classes */
		class?: string;
	}

	const viewBoxSize = 300;

	let {
		duration = 30,
		endTimestamp = null,
		strokeWidth = 20,
		onEnd,
		onTick,
		class: className
	}: Props = $props();

	let remaining = $state(30);
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Sync remaining with duration prop when not running
	$effect(() => {
		if (!endTimestamp) {
			remaining = duration;
		}
	});

	let radius = $derived(viewBoxSize / 2 - strokeWidth);
	let circumference = $derived(2 * Math.PI * radius);
	let progress = $derived(remaining / duration);
	let dashOffset = $derived(circumference * (1 - progress));
	let fontSize = $derived(Math.round(viewBoxSize * 0.2));

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}

	function tick() {
		if (endTimestamp) {
			const now = Date.now();
			const diff = Math.max(0, endTimestamp - now);
			remaining = Math.ceil(diff / 1000);

			onTick?.(remaining);

			if (remaining <= 0) {
				clearInterval(intervalId!);
				intervalId = null;
				onEnd?.();
			}
		}
	}

	// React to endTimestamp changes - start/stop timer
	$effect(() => {
		if (endTimestamp) {
			// Start the timer
			tick();
			intervalId = setInterval(tick, 100);
		} else {
			// Stop timer
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		}

		// Cleanup when effect re-runs or component unmounts
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		};
	});
</script>

<div class={["relative inline-flex items-center justify-center", className]}>
	<svg
		class="absolute -rotate-90"
		width="100%"
		height="100%"
		viewBox="0 0 {viewBoxSize} {viewBoxSize}"
	>
		<!-- Background circle -->
		<circle
			cx={viewBoxSize / 2}
			cy={viewBoxSize / 2}
			r={radius}
			fill="none"
			class="stroke-muted"
			stroke-width={strokeWidth}
		/>
		<!-- Progress circle -->
		<circle
			cx={viewBoxSize / 2}
			cy={viewBoxSize / 2}
			r={radius}
			fill="none"
			class="stroke-primary transition-[stroke-dashoffset] duration-100 ease-linear"
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={dashOffset}
		/>
		<!-- Time display (inside SVG so it scales with viewBox) -->
		<!-- Counter-rotate 90deg around the center so text stays upright -->
		<text
			x={viewBoxSize / 2}
			y={viewBoxSize / 2}
			text-anchor="middle"
			dominant-baseline="central"
			transform="rotate(90, {viewBoxSize / 2}, {viewBoxSize / 2})"
			class="fill-foreground font-bold tabular-nums"
			font-size={fontSize}
			style="font-family: inherit;">{formatTime(remaining)}</text
		>
	</svg>
</div>
