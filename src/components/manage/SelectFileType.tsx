import React from 'react';

interface IProps {
    mediaFileType: string;
    handleMediaFileType: (fileType: string) => void;
}

const SelectFileType = ({ mediaFileType, handleMediaFileType }: IProps) => {
    return (
        <div className="mb-2">
            <div className="mb-3">
                <strong>✅ 신규 후보 미디어를 선택해주세요</strong>
                <p className="mt-1 text-sm text-gray-600">
                    YouTube 영상 또는 10MB 이하의 JPEG, PNG, GIF 이미지를 등록할 수 있습니다.
                </p>
            </div>
            <div className="mb-4">
                <button
                    type="button"
                    className={`px-4 py-2 border rounded-md mr-4 ${
                        mediaFileType === 'file' ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}
                    onClick={() => handleMediaFileType('file')}
                >
                    이미지 파일
                </button>
                <button
                    type="button"
                    className={`px-4 py-2 border rounded-md mr-4 ${
                        mediaFileType === 'video' ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}
                    onClick={() => handleMediaFileType('video')}
                >
                    유튜브 영상
                </button>
            </div>
        </div>
    );
};

export default SelectFileType;
