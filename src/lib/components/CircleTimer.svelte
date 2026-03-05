<script lang="ts">
	import { cn } from "$lib/utils";

	interface Props {
		/** Total duration in seconds */
		duration?: number;
		/** End timestamp in milliseconds - set to start timer, clear to reset */
		endTimestamp?: number | null;
		/** Size of the timer in pixels */
		size?: number;
		/** Stroke width of the progress ring */
		strokeWidth?: number;
		/** Called when timer reaches 0 */
		onEnd?: () => void;
		/** Called each tick with remaining seconds */
		onTick?: (remaining: number) => void;
		/** Additional classes */
		class?: string;
	}

	let {
		duration = 30,
		endTimestamp = null,
		size = 120,
		strokeWidth = 8,
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

	let radius = $derived(size / 2 - strokeWidth);
	let circumference = $derived(2 * Math.PI * radius);
	let progress = $derived(remaining / duration);
	let dashOffset = $derived(circumference * (1 - progress));
	let fontSize = $derived(Math.round(size * 0.2));

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

<div
	class={cn("relative inline-flex items-center justify-center", className)}
	style="width: {size}px; height: {size}px;"
>
	<svg class="absolute -rotate-90" width={size} height={size}>
		<!-- Background circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			class="stroke-muted"
			stroke-width={strokeWidth}
		/>
		<!-- Progress circle -->
		<circle
			cx={size / 2}
			cy={size / 2}
			r={radius}
			fill="none"
			class="stroke-primary transition-[stroke-dashoffset] duration-100 ease-linear"
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-dasharray={circumference}
			stroke-dashoffset={dashOffset}
		/>
	</svg>
	<!-- Time display -->
	<span class="font-bold tabular-nums" style="font-size: {fontSize}px;"
		>{formatTime(remaining)}</span
	>
</div>
