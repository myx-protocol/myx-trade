import React, { type ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import IconButton, { type IconButtonProps } from '@mui/material/IconButton'
import Collapse from '@mui/material/Collapse'
import { styled } from '@mui/material/styles'
import { ArrowDown } from '@/components/Icon'

interface ExpandMoreProps {
  expand: boolean
}

const ExpandMore = styled(({ ...other }: ExpandMoreProps & IconButtonProps) => (
  <IconButton {...other} />
))(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}))

const StyledCard = styled(Card)`
  &.MuiCard-root {
    background-color: var(--base-bg);
    padding: 24px;
    border-radius: 16px;
    color: var(--regular-text);
    display: flex;
    flex-direction: column;
    gap: 16px;

    .MuiCardHeader-root {
      padding: 0;
      color: var(--regular-text);
      .MuiCardHeader-title {
        font-size: 16px;
        font-style: normal;
        font-weight: 500;
        line-height: 100%; /* 16px */
      }
    }
    .MuiCardHeader-action {
      .MuiIconButton-root {
        color: var(--regular-text);
      }
    }
    .MuiCardContent-root {
      padding: 0;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 100%; /* 12px */
      color: var(--secondary-text);
    }
  }
`

export default function CollapsibleCard({
  title,
  children,
  content,
}: {
  title: ReactNode
  children?: ReactNode
  content?: ReactNode
}) {
  const [expanded, setExpanded] = React.useState(true)

  const handleExpandClick = () => {
    setExpanded((prev) => !prev)
  }

  return (
    <StyledCard className={'bg-base-bg'}>
      <CardHeader
        title={title}
        action={
          <ExpandMore
            expand={expanded}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            <ArrowDown size={16} />
          </ExpandMore>
        }
      />
      {content && <CardContent>{content}</CardContent>}

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{children}</CardContent>
      </Collapse>
    </StyledCard>
  )
}
