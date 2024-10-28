import React, { useState, useEffect } from "react"
import BatchSelection from "./BatchSelection"
import ModuleSelection from "./ModuleSelection"
import TopicSelection from "./TopicSelection"
import MarksInput from "./MarksInput"
import SubmitButton from "./SubmitButton"
import StudentSelectionModal from "./Modal"
import * as XLSX from "xlsx"
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
	Pagination,
} from "@mui/material"
import LogoutIcon from "@mui/icons-material/Logout"
import AddIcon from "@mui/icons-material/Add"
import { DatePicker } from "@mui/x-date-pickers"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"

const MentorForm = () => {
	const [batches, setBatches] = useState([])
	const [selectedBatchId, setSelectedBatchId] = useState("")
	const [modules, setModules] = useState([])
	const [selectedModule, setSelectedModule] = useState("")
	const [topics, setTopics] = useState([])
	const [selectedTopics, setSelectedTopics] = useState([])
	const [marks, setMarks] = useState({})
	const [maxMarks, setMaxMarks] = useState({})
	const [total, setTotal] = useState(0)
	const [uploadOption, setUploadOption] = useState("")
	const [adminId, setAdminId] = useState(7)
	const [mentorId, setMentorId] = useState(1017)
	const [manualReferenceId, setManualReferenceId] = useState("REF166")
	const [dateOfAssessment, setDateOfAssessment] = useState(null)
	const [typeOfAssessment, setTypeOfAssessment] = useState("MCQ")
	const [announcementDate, setAnnouncementDate] = useState(null)
	const [manualMarks, setManualMarks] = useState([])
	const [studentSelectionType, setStudentSelectionType] = useState("")
	const [students, setStudents] = useState([])
	const [selectedStudents, setSelectedStudents] = useState([])
	const [showModal, setShowModal] = useState(false)
	const [validatedExcel, setValidatedExcel] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const rowsPerPage = 10

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

	const handleBatchChange = (batchId) => {
		setSelectedBatchId(batchId)
	}

	const fetchStudentsByBatch = async (batchId) => {
		try {
			const studentsResponse = await axios.get(
				`http://49.207.10.13:4017/api/fetchstudentsByBatchId?batchId=${batchId}`,
			)
			setStudents(studentsResponse.data)
			setSelectedStudents(studentsResponse.data)

			const preFilledManualMarks = studentsResponse.data.map((student) => ({
				rollNo: student.StudentID,
				name: student.FirstName,
				marks: {},
			}))
			setManualMarks(preFilledManualMarks)
		} catch (error) {
			console.error("Error fetching students:", error)
		}
	}

	const handleStudentSelection = (type) => {
		setStudentSelectionType(type)

		if (type === "Complete Batch" && selectedBatchId) {
			fetchStudentsByBatch(selectedBatchId)
		} else if (type === "Specific Students") {
			setShowModal(true)
		}
	}

	const handleSaveSelectedStudents = (selectedStudentList) => {
		setSelectedStudents(selectedStudentList)
		setManualMarks(
			selectedStudentList.map((student) => ({
				rollNo: student.StudentID,
				name: student.FirstName,
				marks: {},
			})),
		)
		setShowModal(false)
	}

	const handleFileUpload = (event) => {
		const file = event.target.files[0]
		const reader = new FileReader()
		reader.onload = (e) => {
			const data = new Uint8Array(e.target.result)
			const workbook = XLSX.read(data, { type: "array" })
			const sheetName = workbook.SheetNames[0]
			const sheet = workbook.Sheets[sheetName]
			const parsedData = XLSX.utils.sheet_to_json(sheet)
			console.log("Parsed Excel data:", parsedData)

			const isValid = validateUploadedExcel(parsedData)
			if (isValid) {
				setValidatedExcel(true)
				alert("Excel format is valid!")
			} else {
				setValidatedExcel(false)
				alert("Invalid Excel format. Please upload a valid Excel file.")
			}
		}
		reader.readAsArrayBuffer(file)
	}

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
			headers,
			...selectedStudents.map((student) => [
				student.StudentID,
				student.FirstName,
				...selectedTopics.map(() => ""),
			]),
		]

		const ws = XLSX.utils.aoa_to_sheet(data)
		const wb = XLSX.utils.book_new()
		XLSX.utils.book_append_sheet(wb, ws, "Sample")

		XLSX.writeFile(wb, "sample_excel.xlsx")
	}

	const validateExcelFile = () => {
		if (!validatedExcel) {
			alert(
				"No Excel file uploaded or invalid format. Please upload a valid Excel.",
			)
			return
		}

		alert("Excel format validated successfully!")
	}

	const handleMarksChange = (topicId, value) => {
		const updatedMarks = { ...marks, [topicId]: Number(value) }
		setMarks(updatedMarks)

		const totalMarks = Object.values(updatedMarks).reduce(
			(sum, mark) => sum + (isNaN(mark) ? 0 : mark),
			0,
		)
		setTotal(totalMarks)
	}

	const handleAddRow = () => {
		setManualMarks([...manualMarks, { rollNo: "", name: "", marks: {} }])
	}

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

	const handlePageChange = (event, page) => {
		setCurrentPage(page)
	}

	const indexOfLastRow = currentPage * rowsPerPage
	const indexOfFirstRow = indexOfLastRow - rowsPerPage
	const currentRows = manualMarks.slice(indexOfFirstRow, indexOfLastRow)

	const handleSubmit = () => {
		if (uploadOption === "upload") {
			if (!validatedExcel) {
				alert("Please upload a valid Excel file before submitting.")
				return
			}
			submitExcelData()
		} else if (uploadOption === "enter") {
			if (manualMarks.length === 0 || !areManualMarksValid()) {
				alert("Please fill out the marks table correctly before submitting.")
				return
			}
			submitManualMarks()
		}
		alert("Form submitted successfully!")
	}

	const validateUploadedExcel = (parsedData) => {
		const expectedHeaders = [
			"Roll No",
			"Student Name",
			...selectedTopics.map(
				(topic) =>
					`${topic.TopicName} (Max: ${maxMarks[topic.TopicID] || "N/A"})`,
			),
		]
		const uploadedHeaders = Object.keys(parsedData[0])

		const isValid = expectedHeaders.every((header, index) => {
			return header === uploadedHeaders[index]
		})

		return isValid
	}

	const areManualMarksValid = () => {
		return manualMarks.every((row) => {
			return (
				row.rollNo &&
				row.name &&
				Object.values(row.marks).every((mark) => mark !== "")
			)
		})
	}

	return (
		<>
			<AppBar position='static'>
				<Toolbar>
					<Typography
						variant='h6'
						sx={{ flexGrow: 1 }}>
						<img
							src='../../public/nit-logo.jpg'
							alt='Logo'
							style={{ height: "40px", marginRight: "10px" }}
						/>
					</Typography>
					<Button
						color='inherit'
						startIcon={<LogoutIcon />}>
						Logout
					</Button>
				</Toolbar>
			</AppBar>

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
						<Grid
							item
							xs={12}>
							<BatchSelection
								batches={batches}
								selectedBatch={selectedBatchId}
								onBatchChange={handleBatchChange}
							/>
						</Grid>

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

						<Grid
							item
							xs={12}>
							<FormControl component='fieldset'>
								<FormLabel component='legend'>Type of Assessment</FormLabel>
								<RadioGroup
									row
									name='TypeOfAssessment'
									value={typeOfAssessment}
									onChange={(e) => setTypeOfAssessment(e.target.value)}>
									<FormControlLabel
										value='MCQ'
										control={<Radio />}
										label='MCQ'
									/>
									<FormControlLabel
										value='Description Test'
										control={<Radio />}
										label='Description Test'
									/>
									<FormControlLabel
										value='Coding Test'
										control={<Radio />}
										label='Coding Test'
									/>
									<FormControlLabel
										value='Lab Test'
										control={<Radio />}
										label='Lab Test'
									/>
								</RadioGroup>
							</FormControl>
						</Grid>

						<Grid
							item
							xs={12}>
							<ModuleSelection
								modules={modules}
								onModuleChange={handleModuleChange}
							/>
						</Grid>

						<Grid
							item
							xs={12}>
							<TopicSelection
								topics={topics}
								selectedTopics={selectedTopics}
								onTopicChange={handleTopicChange}
							/>
						</Grid>

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

						<Grid
							item
							xs={12}>
							<Typography variant='h6'>Total Marks: {total}</Typography>
						</Grid>

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

						{uploadOption === "upload" && (
							<Grid
								item
								xs={12}>
								<Button
									variant='contained'
									onClick={handleDownloadSample}
									color='primary'
									sx={{ marginBottom: 2 }}>
									Download Sample Excel
								</Button>

								<input
									type='file'
									accept='.xlsx'
									onChange={handleFileUpload}
									style={{ display: "block", margin: "10px 0" }}
								/>

								<Button
									variant='contained'
									onClick={validateExcelFile}
									color='primary'>
									Validate Excel
								</Button>
							</Grid>
						)}

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
										{currentRows.map((row, index) => (
											<TableRow key={index}>
												<TableCell>
													<TextField
														fullWidth
														value={row.rollNo}
														onChange={(e) =>
															handleManualMarksChange(
																indexOfFirstRow + index,
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
																indexOfFirstRow + index,
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
																handleManualMarksChange(
																	indexOfFirstRow + index,
																	"marks",
																	{ [topic.TopicID]: e.target.value },
																)
															}
														/>
													</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
								<Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
									<Pagination
										count={Math.ceil(manualMarks.length / rowsPerPage)}
										page={currentPage}
										onChange={handlePageChange}
										color='primary'
									/>
								</Box>
							</Grid>
						)}

						<Grid
							item
							xs={12}>
							<SubmitButton
								selectedModule={selectedModule}
								selectedTopics={selectedTopics}
								marks={marks}
								maxMarks={maxMarks}
								BatchId={selectedBatchId}
								uploadOption={uploadOption}
								validatedExcel={validatedExcel}
								manualMarks={manualMarks}
								areManualMarksValid={areManualMarksValid}
							/>
						</Grid>
					</Grid>
				</Container>
			</Box>

			{showModal && (
				<StudentSelectionModal
					students={students}
					selectedStudents={selectedStudents}
					onSave={handleSaveSelectedStudents}
					onClose={() => setShowModal(false)}
				/>
			)}
			{/* End of form */}
		</>
	)
}

export default MentorForm
