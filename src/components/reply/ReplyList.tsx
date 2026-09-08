import { getPassedTimeMessage } from '@/utils/Time';
import moment from 'moment';
import { ReplyData } from '@/services/ReplyService';

interface IProps {
    replyData: ReplyData;
}

const ReplyList = ({ replyData }: IProps) => {
    const { body, createdAt, writerNickname } = replyData;

    return (
        <>
            <article className="bg-zinc-900 border border-zinc-600 p-3 text-base rounded-lg dark:bg-gray-900">
                <footer className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                        <p className="inline-flex items-center mr-3 text-sm font-semibold">
                            <span className="text-yellow-400">{writerNickname}</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            <time
                                dateTime={createdAt}
                                title={moment(createdAt).format('YYYY-MM-DD HH:mm:ss')}
                            >
                                {getPassedTimeMessage(moment(createdAt))}
                            </time>
                        </p>
                    </div>
                </footer>

                <p className="text-white dark:text-gray-400">{body}</p>
            </article>
        </>
    );
};

export default ReplyList;
