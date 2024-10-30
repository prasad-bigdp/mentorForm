import axios from "axios"

const SubmitButton = ({
	selectedModule,
	selectedTopics,
	marks,
	maxMarks,
	uploadOption,
	validatedExcel,
	manualMarks,
	BatchId,
	assessmentDate,
	typeOfAssessment,
}) => {
	const handleSubmit = async () => {
		const formData = {
			AdminId: 9, // Static admin ID
			ManualReferenceId: "REF16fhthyhy6", // Static reference ID
			MentorId: 10176767, // Static mentor ID
			BatchId: BatchId, // Assuming this is the batch ID from batch selection
			DateOfAssessment: assessmentDate
				? assessmentDate
				: new Date().toISOString().split("T")[0], // Replace this with actual date picker value if available
			TypeOfAssessment: typeOfAssessment, // Replace with actual assessment type (dynamic)
			ModuleId: selectedModule,
			students: [],
		}

		// Check if the user uploaded an Excel file or entered marks manually
		if (uploadOption === "upload") {
			manualMarks.forEach((student) => {
				console.log(student.marks)
				const studentData = {
					StudentId: student.rollNo,
					topics: selectedTopics.map((topic) => ({
						TopicId: topic.TopicID,
						MaximumMarks: maxMarks[topic.TopicID] || 100,
						ObtainMarks: student.marks[topic.TopicID] || 0, // Fetch from Excel
					})),
				}
				formData.students.push(studentData)
			})
		} else if (uploadOption === "enter") {
			// Handle manual entry of marks
			manualMarks.forEach((student) => {
				const studentData = {
					StudentId: student.rollNo,
					topics: selectedTopics.map((topic) => ({
						TopicId: topic.TopicID, // Ensure TopicID is available here
						MaximumMarks: maxMarks[topic.TopicID], // Replace with actual max marks if available
						ObtainMarks: student.marks[topic.TopicID] || 0, // Fetch obtained marks for manual entry
					})),
				}
				formData.students.push(studentData)
			})
		}

		// Perform the API call to submit data
		try {
			console.log("Form data being submitted:", formData) // Debugging
			const response = await axios.post(
				"http://49.207.10.13:4017/api/submitAssessmentDetails",
				formData,
			)
			console.log("Form submitted successfully", response.data)
			alert("Form submitted successfully!")
		} catch (error) {
			console.error("Form submission failed", error)
			alert("Form submission failed. Please try again.")
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
