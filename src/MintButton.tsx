import styled from 'styled-components';
import {useEffect, useState} from 'react';
import Button from '@material-ui/core/Button';
import {CircularProgress, Paper} from '@material-ui/core';
import {GatewayStatus, useGateway} from '@civic/solana-gateway-react';
import {CandyMachine} from './candy-machine';


const Image = styled.img`
  height: 100px;
  width: 250px;
`;

export const CTAButton = styled(Button)`
  display: block !important;
  margin: 0 auto !important;
  background-color: #946cee !important;
  min-width: 120px !important;
  font-size: 1em !important;
`;

export const MintButton = ({
                               onMint,
                               candyMachine,
                               isMinting,
                               isActive,
                               isSoldOut
                           }: {
    onMint: () => Promise<void>;
    candyMachine: CandyMachine | undefined;
    isMinting: boolean;
    isActive: boolean;
    isSoldOut: boolean;
}) => {
    const {requestGatewayToken, gatewayStatus} = useGateway();
    const [clicked, setClicked] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        setIsVerifying(false);
        if (gatewayStatus === GatewayStatus.COLLECTING_USER_INFORMATION && clicked) {
            // when user approves wallet verification txn
            setIsVerifying(true);
        } else if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
            console.log('Verified human, now minting...');
            onMint();
            setClicked(false);
        }
    }, [gatewayStatus, clicked, setClicked, onMint]);

    return (
        <CTAButton
            disabled={
                candyMachine?.state.isSoldOut || isSoldOut ||
                isMinting ||
                !isActive ||
                isVerifying
            }
            onClick={async () => {
                if (isActive && candyMachine?.state.gatekeeper && gatewayStatus !== GatewayStatus.ACTIVE) {
                    console.log('Requesting gateway token');
                    setClicked(true);
                    await requestGatewayToken();
                } else {
                    console.log('Minting...');
                    await onMint();
                }
            }}
            variant="contained"
        >
            {!candyMachine ? (
                <Image src="connect.gif"/> // 지갑 connect후 버튼들
            ) : candyMachine?.state.isSoldOut || isSoldOut ? (
                <Image src = "soldout.jpg" />
            ) : isActive ? (
                isVerifying ? 'VERIFYING...' :
                    isMinting ? (
                        <CircularProgress/>
                    ) : (
                        "MINT"
                    )
            ) : (candyMachine?.state.goLiveDate ? (
                "SOON"
            ) : (
                "UNAVAILABLE"
            ))}
        </CTAButton>
    );
};
