const TopicSelection = ({ topics, selectedTopics, onTopicChange }) => {
	const handleCheckboxChange = (topic) => {
		onTopicChange(topic) // Pass the full topic object back to the parent
	}

	return (
		<div className='mb-4'>
			<label className='block text-gray-700'>Topics</label>
			<div className='flex flex-wrap'>
				{topics.map((topic) => (
					<div
						key={topic.TopicID}
						className='mr-4'>
						<input
							key={topic.TopicID}
							type='checkbox'
							value={topic.TopicID}
							checked={selectedTopics.some(
								(selected) => selected.TopicID === topic.TopicID,
							)}
							onChange={() => handleCheckboxChange(topic)}
							className='mr-2'
							id={topic.TopicID}
						/>
						<label htmlFor={topic.TopicID}>{topic.TopicName}</label>
					</div>
				))}
			</div>
		</div>
	)
}

export default TopicSelection
