export interface IChatEngine{
	onReply: (answer: string) => any;
	say(message: string): void;
    user: string;
}