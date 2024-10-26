import React from "react"
import {
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Box,
} from "@mui/material"

const ModuleSelection = ({ modules, onModuleChange }) => {
	return (
		<Box mb={4}>
			<FormControl
				component='fieldset'
				fullWidth>
				<FormLabel
					component='legend'
					className='block text-gray-700'>
					Module
				</FormLabel>
				<RadioGroup
					row
					aria-label='module'
					name='module'>
					{modules.map((mod) => (
						<FormControlLabel
							key={mod.ModuleID}
							value={mod.ModuleID}
							control={<Radio />}
							label={mod.ModuleName}
							onChange={() => onModuleChange(mod.ModuleID)}
						/>
					))}
				</RadioGroup>
			</FormControl>
		</Box>
	)
}

export default ModuleSelection
