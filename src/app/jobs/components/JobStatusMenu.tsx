import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CompletedIcon,
  Schedule as ScheduledIcon,
  PlayArrow as InProgressIcon,
  Cancel as CancelledIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';

interface JobStatusMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', icon: PendingIcon },
  { value: 'SCHEDULED', label: 'Scheduled', icon: ScheduledIcon },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: InProgressIcon },
  { value: 'COMPLETED', label: 'Completed', icon: CompletedIcon },
  { value: 'CANCELLED', label: 'Cancelled', icon: CancelledIcon },
];

export default function JobStatusMenu({ anchorEl, onClose, onStatusChange }: JobStatusMenuProps) {
  const handleStatusSelect = (status: string) => {
    onStatusChange(status);
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {STATUS_OPTIONS.map((option) => (
        <MenuItem
          key={option.value}
          onClick={() => handleStatusSelect(option.value)}
        >
          <ListItemIcon>
            <option.icon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{option.label}</ListItemText>
        </MenuItem>
      ))}
    </Menu>
  );
} 