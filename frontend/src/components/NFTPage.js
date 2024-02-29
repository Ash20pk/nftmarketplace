import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWeb3 } from './ConnectWallet';
import NFTMintDN404 from '../contracts/NFTMintDN404.json';
import { Box, Container, Grid, TextField, Button, Stack, Alert, Typography, ToggleButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import '../App.css';


const NFTPage = () => {
  const { web3js, account, connected } = useWeb3();
  const { contractAddress } = useParams(); // Retrieve the contract address parameter from the URL
  const [name, setName] = useState('');
  const [ipfsLink, setIpfsLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [instance, setInstance] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');

  
  useEffect(() => {
    // Fetch details using contract address
    const fetchDetails = async () => {
      try {
        if(connected){
        setLoading(true);
        setError(null);
        const nftInstance = new web3js.eth.Contract(NFTMintDN404.abi, contractAddress);
        setInstance(nftInstance);
        const nftName = await nftInstance.methods.name().call();
        const metadataIpfsLink = await nftInstance.methods.getURI().call();
        const response = await fetch(metadataIpfsLink);
        const metadata = await response.json();
        const live = await nftInstance.methods.live().call();
        setIsLive(live);
        setIpfsLink(metadata.image); 
        setName(nftName);
        setLoading(false);
        }
        else {
            setError("Wallet not connected");
        }
      } catch (error) {
        setError(error.message || 'An error occurred while fetching the details');
        console.error('Error fetching details:', error);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [connected]);

  const mintNFT = async () => {
        try {
            setLoading(true);
            const WeiAmount = web3js.utils.toWei(amount, 'ether')
            await instance.methods.mint(WeiAmount).send({from: account});
            setMessage("NFT Minted Successfully")
            setLoading(false);
        } catch (error) {
            console.error('Error minting', error);
        }
    };

  const toggleLive = async () => {
    try {
      await instance.methods.toggleLive().send({from: account});
    } catch (error) {
      console.error('Error toggling live status', error);
    }
  };

  console.log(name, ipfsLink, contractAddress, isLive);

  return (
    <Stack sx={{ height: '80vh' }} spacing={3} alignItems="center" justifyContent="center" textAlign= "center">
        <Typography variant="overline" fontSize={20} sx={{margin: 5}}>Mint your {name} NFT now</Typography>
          <Box sx={{height: '30rem', border: '1px dashed grey', borderRadius:3, width: '30rem', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {connected ? (
                loading ? (
                    <CircularProgress />  
                ) : (
                    <Box component="img" src={ipfsLink} sx={{ height: '100%', width: '100%', borderRadius: 3}} />
                )
            ) : (
                <Alert severity="error">Wallet not connected</Alert>
            )}
            </Box >
            <Box sx={{ justifyContent: "center", alignItems: "center", margin: 2, display: 'flex'}}>
            {connected && <ToggleButton 
                    value="live" 
                    onClick={toggleLive}
                    >
                    {isLive ? 'Public Mint Live' : 'Public Mint Offline'}  
                </ToggleButton>}
                </Box>
            <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                <Stack spacing={1} alignItems="center">
                  <Typography variant="p" justifyContent="center"> Amount:</Typography>
                  <TextField
                    name="amount"
                    placeholder='Enter the amount you want to mint'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  {loading ? (
                    <CircularProgress />  
                ) : (
                    <>
                  <Button variant='outlined' onClick={mintNFT}> Mint NFT</Button>
                    </>
                )}
                  {message && <Alert security='success'>{message}</Alert>}
                </Stack>
            </Box>
            <Typography variant="overline">Want to create your own ERC404 NFT? <a href='https://nftmarketplace-a.vercel.app/create-nft'>click here</a> 🔥</Typography>
    </Stack>
  );
              }

export default NFTPage;
