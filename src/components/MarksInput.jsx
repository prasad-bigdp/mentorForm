import React from "react"
import { TextField, Grid, Box, Typography } from "@mui/material"

const MarksInput = ({ selectedTopics, marks, setMarks, setMaxMarks }) => {
	const handleMaxMarksChange = (topicId, value) => {
		setMaxMarks((prevMaxMarks) => ({
			...prevMaxMarks,
			[topicId]: Number(value),
		}))
	}

	return (
		<Box mb={4}>
			<Typography
				variant='h6'
				gutterBottom>
				Configure Marks
			</Typography>
			{selectedTopics.map((topic) => (
				<Grid
					container
					spacing={2}
					alignItems='center'
					key={topic.TopicID}>
					<Grid
						item
						xs={6}>
						<Typography>{topic.TopicName}</Typography>
					</Grid>
					<Grid
						item
						xs={6}>
						<TextField
							type='number'
							label='Max Marks'
							value={marks[topic.TopicID] || ""}
							onChange={(e) => {
								handleMaxMarksChange(topic.TopicID, e.target.value)
								setMarks(topic.TopicID, e.target.value)
							}}
							variant='outlined'
							fullWidth
						/>
					</Grid>
				</Grid>
			))}
		</Box>
	)
}

export default MarksInput
