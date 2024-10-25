import React, { useState } from "react"
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
} from "@mui/material"

const StudentSelectionModal = ({
	students,
	selectedStudents,
	onSave,
	onClose,
}) => {
	const [selected, setSelected] = useState([...selectedStudents])

	const handleStudentToggle = (student) => {
		const isSelected = selected.includes(student)
		if (isSelected) {
			setSelected(selected.filter((s) => s !== student))
		} else {
			setSelected([...selected, student])
		}
	}

	const handleSave = () => {
		onSave(selected)
	}

	return (
		<Dialog
			open
			onClose={onClose}>
			<DialogTitle>Select Students</DialogTitle>
			<DialogContent>
				<FormGroup>
					{students.map((student) => (
						<FormControlLabel
							key={student.StudentID}
							control={
								<Checkbox
									checked={selected.includes(student)}
									onChange={() => handleStudentToggle(student)}
								/>
							}
							label={`${student.StudentID} - ${student.FirstName}`}
						/>
					))}
				</FormGroup>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleSave}
					color='primary'>
					Save
				</Button>
				<Button
					onClick={onClose}
					color='secondary'>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	)
}

export default StudentSelectionModal
