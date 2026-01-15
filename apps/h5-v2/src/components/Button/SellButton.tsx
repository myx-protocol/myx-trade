import styled from '@emotion/styled'
import { Button } from '@mui/material'

export const SellButton = styled(Button)` {}
  &.MuiButton-contained {
      color: var(--basic-white);
      height: 44px;
      padding: 0 20px;
      border-radius: 8px;
      box-shadow: inset 0 0 0 0.5px rgba(246, 98, 118, 1);
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
