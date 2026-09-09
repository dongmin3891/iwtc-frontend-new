import React from 'react';

interface IProps {
    visibleType: string;
    handleVisibleType: (visibleType: string) => void;
}

const SelectVisibleType = ({ visibleType, handleVisibleType }: IProps) => {
    return (
        <div className="mb-2">
            <div className="mb-3">
                <strong>공개 여부 </strong>
            </div>
            <div className="flex items-center space-x-4 ml-3">
                <label
                    className={`inline-flex items-center px-4 py-2 border rounded-md cursor-pointer ${
                        visibleType === 'PUBLIC' ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}
                    onClick={() => handleVisibleType('PUBLIC')}
                >
                    공개
                    <input
                        type="radio"
                        className="hidden"
                        name="radioOption"
                        value="option1"
                        checked={visibleType === 'PUBLIC'}
                        onChange={() => {}}
                    />
                </label>

                <label
                    className={`inline-flex items-center px-4 py-2 border rounded-md cursor-pointer ${
                        visibleType === 'PRIVATE' ? 'bg-blue-500 text-white' : 'bg-white'
                    }`}
                    onClick={() => handleVisibleType('PRIVATE')}
                >
                    비공개
                    <input
                        type="radio"
                        className="hidden"
                        name="radioOption"
                        value="option2"
                        checked={visibleType === 'PRIVATE'}
                        onChange={() => {}}
                    />
                </label>
            </div>
        </div>
    );
};

export default SelectVisibleType;
