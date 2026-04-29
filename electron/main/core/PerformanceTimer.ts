
/**
 * 性能计时器
 */
export class PerformanceTimer {
    private marks = new Map<string, number>();

    mark(name: string): void {
        this.marks.set(name, Date.now());
    }

    measure(name: string, startMark: string): number {
        const start = this.marks.get(startMark);
        if (!start) return 0;
        const duration = Date.now() - start;
        console.log(`⏱️ ${name}: ${duration}ms`);
        return duration;
    }

    getStats(): Record<string, number> {
        const stats: Record<string, number> = {};
        const entries = Array.from(this.marks.entries());
        for (let i = 1; i < entries.length; i++) {
            const [name, time] = entries[i];
            const [prevName, prevTime] = entries[i - 1];
            stats[`${prevName}->${name}`] = time - prevTime;
        }
        return stats;
    }
}
