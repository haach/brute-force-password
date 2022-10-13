import { Chip } from '@mui/material';
import { FC } from 'react';
import { AiFillCheckCircle } from 'react-icons/ai';
import { TiDelete } from 'react-icons/ti';

export const ChipWithIcon: FC<{ label: string; isActive: boolean }> = ({
  label,
  isActive,
}) => {
  return (
    <Chip
      label={label}
      size="small"
      icon={isActive ? <AiFillCheckCircle /> : <TiDelete />}
      color={isActive ? 'success' : undefined}
    />
  );
};
