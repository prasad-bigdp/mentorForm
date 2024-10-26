import axios from "axios"

const SubmitButton = ({
	selectedModule,
	manualMarks,
	selectedTopics,
	maxMarks,
	dateOfAssessment,
}) => {
	const handleSubmit = async () => {
		const payload = {
			AdminId: 7, // Example
			ManualReferenceId: "REF166", // Example reference
			MentorId: 1017, // Example mentor ID
			BatchId: 2028, // Assuming batch is already selected in the form
			DateOfAssessment: dateOfAssessment || "2023-10-31", // Format the date appropriately
			TypeOfAssessment: "MCQ", // Or get this from user input
			ModuleId: selectedModule, // Pass the selected module ID
			students: manualMarks.map((student) => {
				return {
					StudentId: student.rollNo, // Assuming rollNo is StudentId
					topics: selectedTopics.map((topic) => ({
						TopicId: topic.TopicID, // Assuming TopicID is the id
						MaximumMarks: maxMarks[topic.TopicID] || 100, // Get the max marks for the topic
						ObtainMarks: student.marks[topic.TopicID] || 0, // Get the student's obtained marks for the topic
					})),
				}
			}),
		}

		try {
			const response = await axios.post(
				"http://49.207.10.13:4017/api/insertUpdateStudentLabMarks",
				payload,
			)
			console.log("Form submitted successfully", response.data)
		} catch (error) {
			console.error("Form submission failed", error)
		}
	}

	return (
		<button
			className='bg-blue-500 text-white p-2 rounded'
			onClick={handleSubmit}>
			Submit
		</button>
	)
}

export default SubmitButton
