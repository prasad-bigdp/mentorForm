import axios from "axios"

const SubmitButton = ({
	selectedModule,
	selectedTopics,
	marks,
	uploadOption,
	validatedExcel,
	manualMarks,
}) => {
	const handleSubmit = async () => {
		const formData = {
			AdminId: 7, // Static admin ID
			ManualReferenceId: "REF166", // Static reference ID
			MentorId: 1017, // Static mentor ID
			BatchId: selectedModule, // Assuming this is the batch ID
			DateOfAssessment: new Date().toISOString().split("T")[0], // Replace this with actual date picker value
			TypeOfAssessment: "MCQ", // Replace with actual assessment type if needed
			students: [],
		}

		// Check if the user uploaded an Excel file or entered marks manually
		if (uploadOption === "upload") {
			if (!validatedExcel) {
				alert("Please upload a valid Excel file before submitting.")
				return
			}
			// Process uploaded Excel data (this part should already be handled elsewhere)
		} else if (uploadOption === "enter") {
			// Handle manual entry of marks
			manualMarks.forEach((student) => {
				const studentData = {
					StudentId: student.rollNo,
					topics: selectedTopics.map((topic) => ({
						TopicId: topic.TopicID, // Ensure TopicID is available here
						MaximumMarks: topic.MaxMarks || 100, // Replace with actual max marks if available
						ObtainMarks: marks[topic.TopicID] || 0, // Fetch obtained marks
					})),
				}
				formData.students.push(studentData)
			})
		}

		// Perform the API call to submit data
		try {
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
