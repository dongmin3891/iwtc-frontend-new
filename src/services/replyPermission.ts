export const canDeleteReply = (commentWriterId: number | null, currentMemberId?: number | null) => {
    return currentMemberId != null && commentWriterId === currentMemberId;
};
