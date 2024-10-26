import React, { useState, useEffect } from "react"
import {
	Box,
	Modal,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	Typography,
	TextField,
	Pagination,
} from "@mui/material"

const StudentSelectionModal = ({
	students,
	selectedStudents,
	onSave,
	onClose,
}) => {
	// State to manage the selected checkboxes
	const [selected, setSelected] = useState([])
	const [searchQuery, setSearchQuery] = useState("") // State for the search query
	const [currentPage, setCurrentPage] = useState(1) // State for pagination
	const studentsPerPage = 10 // Number of students per page

	// Initialize selected with empty by default and update if the user has selected students
	useEffect(() => {
		setSelected(selectedStudents.map((student) => student.StudentID)) // Only map to IDs
	}, [selectedStudents])

	// Handle checkbox change
	const handleCheckboxChange = (studentId) => {
		setSelected(
			(prevSelected) =>
				prevSelected.includes(studentId)
					? prevSelected.filter((id) => id !== studentId) // Uncheck
					: [...prevSelected, studentId], // Check
		)
	}

	// Handle saving selected students
	const handleSave = () => {
		const selectedStudentList = students.filter((student) =>
			selected.includes(student.StudentID),
		)
		onSave(selectedStudentList) // Pass the selected students back to the parent
	}

	// Filter students based on the search query
	const filteredStudents = students.filter((student) =>
		student.FirstName.toLowerCase().includes(searchQuery.toLowerCase()),
	)

	// Pagination Logic
	const indexOfLastStudent = currentPage * studentsPerPage
	const indexOfFirstStudent = indexOfLastStudent - studentsPerPage
	const currentStudents = filteredStudents.slice(
		indexOfFirstStudent,
		indexOfLastStudent,
	)

	const handlePageChange = (event, page) => {
		setCurrentPage(page) // Update the current page
	}

	return (
		<Modal
			open
			onClose={onClose}
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			<Box
				sx={{
					width: 400,
					bgcolor: "background.paper",
					p: 4,
					borderRadius: 2,
					boxShadow: 24,
				}}>
				{/* Header */}
				<Typography
					variant='h6'
					align='center'>
					Select Students
				</Typography>

				{/* Total and Selected Count */}
				<Typography
					variant='body2'
					align='center'
					sx={{ mt: 1, mb: 2 }}>
					Total: {filteredStudents.length} | Selected: {selected.length}
				</Typography>

				{/* Search Input */}
				<TextField
					fullWidth
					variant='outlined'
					label='Search students'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					sx={{ mb: 2 }}
				/>

				{/* Student List with Checkboxes */}
				<FormGroup>
					{currentStudents.map((student) => (
						<FormControlLabel
							key={student.StudentID}
							control={
								<Checkbox
									checked={selected.includes(student.StudentID)}
									onChange={() => handleCheckboxChange(student.StudentID)}
								/>
							}
							label={student.StudentID}
						/>
					))}
				</FormGroup>

				{/* Pagination */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						mt: 2,
					}}>
					<Pagination
						count={Math.ceil(filteredStudents.length / studentsPerPage)}
						page={currentPage}
						onChange={handlePageChange}
						color='primary'
					/>
				</Box>

				{/* Save and Close Buttons */}
				<Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
					<Button
						onClick={onClose}
						variant='outlined'>
						Close
					</Button>
					<Button
						onClick={handleSave}
						variant='contained'
						color='primary'>
						Save
					</Button>
				</Box>
			</Box>
		</Modal>
	)
}

export default StudentSelectionModal
