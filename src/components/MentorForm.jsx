import React, { useState, useEffect } from "react"
import BatchSelection from "./BatchSelection"
import ModuleSelection from "./ModuleSelection"
import TopicSelection from "./TopicSelection"
import MarksInput from "./MarksInput"
import SubmitButton from "./SubmitButton"
import StudentSelectionModal from "./Modal" // Import modal for specific student selection
import * as XLSX from "xlsx" // Import xlsx library
import axios from "axios"
import {
	AppBar,
	Box,
	Button,
	Container,
	Grid,
	Toolbar,
	Typography,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TextField,
} from "@mui/material"
import { IconButton } from "@mui/material"

import LogoutIcon from "@mui/icons-material/Logout"
import AddIcon from "@mui/icons-material/Add"

// Import these from @mui/x-date-pickers
import { DatePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs" // Adapter for Day.js

const MentorForm = () => {
	const [batches, setBatches] = useState([])
	const [selectedBatchId, setSelectedBatchId] = useState("") // Ensure it's initialized correctly
	const [modules, setModules] = useState([])
	const [selectedModule, setSelectedModule] = useState("")
	const [topics, setTopics] = useState([])
	const [selectedTopics, setSelectedTopics] = useState([])
	const [marks, setMarks] = useState({})
	const [maxMarks, setMaxMarks] = useState({}) // Max marks for each topic
	const [total, setTotal] = useState(0) // Total marks state
	const [uploadOption, setUploadOption] = useState("") // Upload or enter marks
	const [announcementDate, setAnnouncementDate] = useState(null)
	const [manualMarks, setManualMarks] = useState([]) // For manual entry
	const [studentSelectionType, setStudentSelectionType] = useState("") // "Specific Students" or "Complete Batch"
	const [students, setStudents] = useState([]) // Store all students from batch
	const [selectedStudents, setSelectedStudents] = useState([]) // Store selected students
	const [showModal, setShowModal] = useState(false) // Modal visibility for specific students

	// Fetch batches and modules when the component loads
	useEffect(() => {
		const fetchBatchesAndModules = async () => {
			try {
				const batchResponse = await axios.get(
					"http://49.207.10.13:4017/apinit/fetchbatchesByTechnologyId?TechnologyId=87",
				)
				setBatches(batchResponse.data)

				const moduleResponse = await axios.get(
					"http://49.207.10.13:4017/apinit/fetchModulesByTechnologyId?TechnologyId=87",
				)
				setModules(moduleResponse.data)
			} catch (error) {
				console.error("Error fetching batches or modules:", error)
			}
		}

		fetchBatchesAndModules()
	}, [])

	// Fetch topics when a module is selected
	const handleModuleChange = async (moduleId) => {
		setSelectedModule(moduleId)
		try {
			const topicsResponse = await axios.get(
				`http://49.207.10.13:4017/apinit/fetchTopicsByModuleId?ModuleId=${moduleId}`,
			)
			setTopics(topicsResponse.data)
		} catch (error) {
			console.error("Error fetching topics:", error)
		}
	}

	// Handle topic selection (store full topic object)
	const handleTopicChange = (selectedTopic) => {
		const isAlreadySelected = selectedTopics.find(
			(topic) => topic.TopicID === selectedTopic.TopicID,
		)

		if (isAlreadySelected) {
			setSelectedTopics(
				selectedTopics.filter(
					(topic) => topic.TopicID !== selectedTopic.TopicID,
				),
			)
		} else {
			setSelectedTopics([...selectedTopics, selectedTopic])
		}
	}

	// Handle batch selection
	const handleBatchChange = (batchId) => {
		setSelectedBatchId(batchId) // Update state with the selected batch ID
	}

	// Fetch students for complete batch selection
	const fetchStudentsByBatch = async (batchId) => {
		try {
			const studentsResponse = await axios.get(
				`http://49.207.10.13:4017/api/fetchstudentsByBatchId?batchId=${batchId}`,
			)
			setStudents(studentsResponse.data) // Store students fetched from the batch
			setSelectedStudents(studentsResponse.data) // Preselect all students if complete batch is selected

			// Pre-fill manualMarks with the fetched students' roll numbers and names
			const preFilledManualMarks = studentsResponse.data.map((student) => ({
				rollNo: student.StudentID,
				name: student.FirstName,
				marks: {}, // Initialize marks as an empty object
			}))
			setManualMarks(preFilledManualMarks) // Set manualMarks with the pre-filled data
		} catch (error) {
			console.error("Error fetching students:", error)
		}
	}

	// Handle student selection type (Complete Batch or Specific Students)
	const handleStudentSelection = (type) => {
		setStudentSelectionType(type)

		if (type === "Complete Batch" && selectedBatchId) {
			// Fetch students based on selected batch
			fetchStudentsByBatch(selectedBatchId)
		} else if (type === "Specific Students") {
			// Show modal for specific student selection
			setShowModal(true)
		}
	}

	// Handle saving selected students from modal
	const handleSaveSelectedStudents = (selectedStudentList) => {
		setSelectedStudents(selectedStudentList) // Save only the selected students
		setManualMarks(
			selectedStudentList.map((student) => ({
				rollNo: student.StudentID,
				name: student.FirstName,
				marks: {}, // Initialize marks for manual entry
			})),
		)
		setShowModal(false) // Close modal after saving selected students
	}

	// Handle file upload (Excel file)
	const handleFileUpload = (event) => {
		const file = event.target.files[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			const data = new Uint8Array(e.target.result)
			const workbook = XLSX.read(data, { type: "array" })
			const sheetName = workbook.SheetNames[0]
			const sheet = workbook.Sheets[sheetName]
			const parsedData = XLSX.utils.sheet_to_json(sheet)
			console.log("Parsed Excel data:", parsedData) // Process Excel data
		}
		reader.readAsArrayBuffer(file)
	}

	// Handle Excel download for students
	const handleDownloadExcel = () => {
		const headers = ["Roll No", "Student Name"]
		const data = [
			headers,
			...selectedStudents.map((student) => [
				student.StudentID,
				student.FirstName,
			]),
		]

		const ws = XLSX.utils.aoa_to_sheet(data)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Students")
		XLSX.writeFile(wb, "students_list.xlsx")
	}

	// Handle marks input and update total dynamically
	const handleMarksChange = (topicId, value) => {
		const updatedMarks = { ...marks, [topicId]: Number(value) }
		setMarks(updatedMarks)

		// Calculate total
		const totalMarks = Object.values(updatedMarks).reduce(
			(sum, mark) => sum + (isNaN(mark) ? 0 : mark), // Make sure to ignore NaN values
			0,
		)
		setTotal(totalMarks) // Update total marks
	}

	// Download sample Excel with selected students and topics
	const handleDownloadSample = () => {
		const headers = [
			"Roll No",
			"Student Name",
			...selectedTopics.map(
				(topic) =>
					`${topic.TopicName} (Max: ${maxMarks[topic.TopicID] || "N/A"})`,
			),
		]

		const data = [
			headers, // Add header row
			...selectedStudents.map((student) => [
				student.StudentID,
				student.FirstName,
				...selectedTopics.map(() => ""), // Leave marks empty
			]),
		]

		const ws = XLSX.utils.aoa_to_sheet(data)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Sample")

		XLSX.writeFile(wb, "sample_excel.xlsx")
	}

	// Handle adding a new row for manual marks entry
	const handleAddRow = () => {
		setManualMarks([...manualMarks, { rollNo: "", name: "", marks: {} }])
	}

	// Handle updating marks in the manual table
	const handleManualMarksChange = (index, field, value) => {
		const updatedRows = manualMarks.map((row, idx) =>
			idx === index
				? {
						...row,
						[field]: field === "marks" ? { ...row.marks, ...value } : value,
				  }
				: row,
		)
		setManualMarks(updatedRows)
	}

	return (
		<>
			{/* Header with Logo, Name and Logout */}
			<AppBar position='static'>
				<Toolbar>
					<Typography
						variant='h6'
						sx={{ flexGrow: 1 }}>
						<img
							src='/path/to/logo.png'
							alt='Logo'
							style={{ height: "40px", marginRight: "10px" }}
						/>
						Mentor Form
					</Typography>
					<Button
						color='inherit'
						startIcon={<LogoutIcon />}>
						Logout
					</Button>
				</Toolbar>
			</AppBar>

			{/* Centering the Form */}
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
				}}>
				<Container
					maxWidth='md'
					sx={{ p: 4 }}>
					<Typography
						variant='h4'
						align='center'
						gutterBottom>
						Mentor Form
					</Typography>

					<Grid
						container
						spacing={4}>
						{/* Batch Selection */}
						<Grid
							item
							xs={12}>
							<BatchSelection
								batches={batches}
								selectedBatch={selectedBatchId} // Pass the selected batch ID
								onBatchChange={handleBatchChange} // Capture selected batch ID and update state
							/>
						</Grid>

						{/* Student Selection */}
						<Grid
							item
							xs={12}>
							<FormControl component='fieldset'>
								<FormLabel component='legend'>Select Student Type</FormLabel>
								<RadioGroup
									row
									name='StudentsType'
									value={studentSelectionType}
									onChange={(e) => handleStudentSelection(e.target.value)}>
									<FormControlLabel
										value='Specific Students'
										control={<Radio />}
										label='Specific Students'
									/>
									<FormControlLabel
										value='Complete Batch'
										control={<Radio />}
										label='Complete Batch'
									/>
								</RadioGroup>
							</FormControl>
						</Grid>

						{/* Date of Announcement with LocalizationProvider */}
						<Grid
							item
							xs={12}>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<DatePicker
									label='Date of Announcement'
									value={announcementDate}
									onChange={(newValue) => setAnnouncementDate(newValue)}
									renderInput={(params) => (
										<TextField
											{...params}
											fullWidth
										/>
									)}
								/>
							</LocalizationProvider>
						</Grid>

						{/* Module Selection */}
						<Grid
							item
							xs={12}>
							<ModuleSelection
								modules={modules}
								onModuleChange={handleModuleChange}
							/>
						</Grid>

						{/* Topic Selection */}
						<Grid
							item
							xs={12}>
							<TopicSelection
								topics={topics}
								selectedTopics={selectedTopics}
								onTopicChange={handleTopicChange}
							/>
						</Grid>

						{/* Marks Input */}
						<Grid
							item
							xs={12}>
							<MarksInput
								selectedTopics={selectedTopics}
								marks={marks}
								setMarks={handleMarksChange}
								maxMarks={maxMarks}
								setMaxMarks={setMaxMarks}
							/>
						</Grid>

						{/* Total Marks Display */}
						<Grid
							item
							xs={12}>
							<Typography variant='h6'>Total Marks: {total}</Typography>
						</Grid>

						{/* Upload or Enter Marks */}
						<Grid
							item
							xs={12}>
							<FormControl component='fieldset'>
								<FormLabel component='legend'>Upload or Enter Marks</FormLabel>
								<RadioGroup
									row
									name='uploadOption'
									value={uploadOption}
									onChange={(e) => setUploadOption(e.target.value)}>
									<FormControlLabel
										value='upload'
										control={<Radio />}
										label='Upload from Excel'
									/>
									<FormControlLabel
										value='enter'
										control={<Radio />}
										label='Enter Marks Manually'
									/>
								</RadioGroup>
							</FormControl>
						</Grid>

						{/* Upload Section */}
						{uploadOption === "upload" && (
							<Grid
								item
								xs={12}>
								<Button
									variant='contained'
									onClick={handleDownloadSample}
									color='primary'>
									Download Sample Excel
								</Button>
							</Grid>
						)}

						{/* Manual Entry Table */}
						{uploadOption === "enter" && (
							<Grid
								item
								xs={12}>
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>Roll No</TableCell>
											<TableCell>Student Name</TableCell>
											{selectedTopics.map((topic) => (
												<TableCell key={topic.TopicID}>
													{topic.TopicName} (Max:{" "}
													{maxMarks[topic.TopicID] || "N/A"})
												</TableCell>
											))}
										</TableRow>
									</TableHead>
									<TableBody>
										{manualMarks.map((row, index) => (
											<TableRow key={index}>
												<TableCell>
													<TextField
														fullWidth
														value={row.rollNo}
														onChange={(e) =>
															handleManualMarksChange(
																index,
																"rollNo",
																e.target.value,
															)
														}
													/>
												</TableCell>
												<TableCell>
													<TextField
														fullWidth
														value={row.name}
														onChange={(e) =>
															handleManualMarksChange(
																index,
																"name",
																e.target.value,
															)
														}
													/>
												</TableCell>
												{selectedTopics.map((topic) => (
													<TableCell key={topic.TopicID}>
														<TextField
															type='number'
															fullWidth
															value={row.marks[topic.TopicID] || ""}
															onChange={(e) =>
																handleManualMarksChange(index, "marks", {
																	[topic.TopicID]: e.target.value,
																})
															}
														/>
													</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
								<IconButton
									onClick={handleAddRow}
									color='primary'>
									<AddIcon />
								</IconButton>
							</Grid>
						)}

						{/* Submit Button */}
						<Grid
							item
							xs={12}>
							<SubmitButton
								selectedModule={selectedModule}
								selectedTopics={selectedTopics}
								marks={marks}
							/>
						</Grid>
					</Grid>
				</Container>
			</Box>

			{/* Modal for selecting specific students */}
			{showModal && (
				<StudentSelectionModal
					students={students} // Pass all students from the batch
					selectedStudents={selectedStudents} // Currently selected students
					onSave={handleSaveSelectedStudents} // Handle saving
					onClose={() => setShowModal(false)} // Close the modal
				/>
			)}
		</>
	)
}

export default MentorForm
