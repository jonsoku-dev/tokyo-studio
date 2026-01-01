import type {
	commentNotifications,
	commentReports,
	commentVotes,
	communityComments,
} from "@itcom/db/schema";

export type InsertComment = typeof communityComments.$inferInsert;
export type SelectComment = typeof communityComments.$inferSelect;

export type InsertVote = typeof commentVotes.$inferInsert;
export type SelectVote = typeof commentVotes.$inferSelect;

export type InsertNotification = typeof commentNotifications.$inferInsert;
export type SelectNotification = typeof commentNotifications.$inferSelect;

export type InsertReport = typeof commentReports.$inferInsert;

export type CommentWithAuthor = SelectComment & {
	author: {
		id: string;
		name: string;
		avatarUrl: string | null;
		avatarThumbnailUrl: string | null;
	} | null;
	score?: number;
	userVote?: number; // 1 | -1 | 0
	children?: CommentWithAuthor[];
	replyCount?: number;
};

export type NotificationWithData = SelectNotification & {
	actor: {
		id: string;
		name: string;
		avatarUrl: string | null;
		avatarThumbnailUrl: string | null;
	};
	comment: {
		id: string;
		content: string;
		postId: string | null;
	};
};
