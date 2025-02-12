export interface Interrupt {
    value: string;
    resumable: boolean;
    ns: null;
    when: string;
}

export type InterruptResponse = "yes" | "no";

export interface InterruptCommand {
    resume: InterruptResponse;
} 