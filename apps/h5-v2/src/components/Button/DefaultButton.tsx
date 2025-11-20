import { Button, styled } from '@mui/material'

export const DefaultButton = styled(Button)` {}
  &.MuiButton-contained {
      color: var(--secondary-text);
      height: 44px;
      padding: 0 20px;
      border-radius: 8px;
      border: 1px solid var(--dark-border);
      background: var(--dark-border);
      font-size: 13px;
      font-style: normal;
      font-weight: 500;
      line-height: 100%; /* 13px */
      cursor: pointer;
      &[disabled] {
          //opacity: 0.3;
          cursor: not-allowed;
      }
  }
`
