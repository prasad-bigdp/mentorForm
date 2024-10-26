import axios from "axios"

const SubmitButton = ({
	selectedModule,
	selectedTopics,
	marks,
	uploadOption,
	validatedExcel,
	manualMarks,
	areManualMarksValid,
}) => {
	const handleSubmit = async () => {
		// Excel or Manual validation check
		if (uploadOption === "upload" && !validatedExcel) {
			alert("Please upload a valid Excel file.")
			return
		}

		if (uploadOption === "enter" && !areManualMarksValid()) {
			alert("Please fill in all required fields in the manual table.")
			return
		}

		// Prepare form data for submission
		const formData = {
			selectedModule,
			selectedTopics,
			marks,
		}

		try {
			const response = await axios.post("/api/submit-form", formData) // Replace with your actual API endpoint
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
