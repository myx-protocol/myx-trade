import styled from '@emotion/styled'
import { Button } from '@mui/material'

export const SellButton = styled(Button)` {}
  &.MuiButton-contained {
      color: var(--basic-white);
      height: 44px;
      padding: 0 20px;
      border-radius: 8px;
      border: 1px solid var(--sell-border);
      background: var(--sell-gradient);
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 13px */
      cursor: pointer;
      &[disabled] {
          opacity: 0.3;
          cursor: not-allowed;
      }
  }
`
