import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import ColoredLabelInput, { ColoredLabelInputValue } from '@/components/Inputs/ColoredLabelInput'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import { ReactComponent as MainAddressBadge } from '@/images/main_address_badge.svg'

interface AddressMetadataFormProps {
  label: ColoredLabelInputValue
  setLabel: (label: ColoredLabelInputValue) => void
  defaultAddressMessage: string
  isDefault: boolean
  setIsDefault: (isDefault: boolean) => void
  isDefaultAddressToggleEnabled: boolean
  singleAddress?: boolean
}

const AddressMetadataForm = ({
  label,
  setLabel,
  defaultAddressMessage,
  singleAddress,
  isDefault,
  setIsDefault,
  isDefaultAddressToggleEnabled
}: AddressMetadataFormProps) => {
  const { t } = useTranslation()

  return (
    <>
      <ColoredLabelInput label={t('Address label')} onChange={setLabel} value={label} id="label" maxLength={50} />
      {singleAddress && (
        <>
          <HorizontalDivider narrow />
          <InlineLabelValueInput
            label={
              <Label>
                <StyledMainAddressBadge width={11} /> {t('Default address')}
              </Label>
            }
            description={defaultAddressMessage}
            noHorizontalPadding
            InputComponent={
              <Toggle
                toggled={isDefault}
                label={t('Make this your default address')}
                onToggle={() => setIsDefault(!isDefault)}
                disabled={!isDefaultAddressToggleEnabled}
              />
            }
          />
        </>
      )}
    </>
  )
}

export default AddressMetadataForm

const Label = styled.div`
  display: flex;
  align-items: center;
`

const StyledMainAddressBadge = styled(MainAddressBadge)`
  width: 11px;
  margin-right: var(--spacing-1);
  fill: ${({ theme }) => theme.font.primary};
`
