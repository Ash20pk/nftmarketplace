import React, { useState, useEffect } from 'react';
import { useWeb3 } from './ConnectWallet';
import { Box, Container, Grid, TextField, Button, Stack, Alert, Typography, Modal } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import {uploadWithMetadata} from './UploadIPFS';
import Confetti from 'react-confetti'
import CloseIcon from '@mui/icons-material/Close';



const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '100%',
    width: '100%',
    opacity: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
});


function CreateNFT() {
    const { web3js, account, connected, nftFactoryContract } = useWeb3();
    const [open, setOpen] = useState(true);
    const [createNftData, setCreateNftData] = useState({
        NFTname: '',
        symbol: '',
        max_supply: '',
        publicPrice: 0,
        initialTokenSupply: 0,
    });
    const handleClose = () => {
        setOpen(false);
    };

    const handleShare = () => {
        const contractAddressLink = `${window.location.href}/${contractAddress}`;
        const courseLink = "https://metaschool.so/courses/build-marketplace-erc404-tokens"
        const tweetText = encodeURIComponent(`Check out my dope 404 NFT! 🚀 ${contractAddressLink} \n\nP.S. Interested in learning how to build your own ERC404 Marketplace? Enroll in the free course now by @0xmetaschool\n\n ${courseLink}`);

        window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
        console.log('Sharing to Twitter...');
    };
    const [contractAddress, setContractAddress] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const handleChange = (e) => {
        setCreateNftData({
            ...createNftData,
            [e.target.name]: e.target.value
        });
    }


    const handleImageUpload = (e) => {
        setImage(e.target.files[0]);
    }

    useEffect(() => {
        // Fetch details using contract address
        console.log("connected", connected);
    },[connected]);

    const createNFT = async () => {
        setLoading(true);
        setLoadingMessage("Let's first upload your cool image to IPFS");
        const ipfs = await uploadWithMetadata(image);
        console.log(ipfs);
        setLoadingMessage("let's now create a NFT using the image, are you ready?");
        await nftFactoryContract.methods.createTokenContract(
            createNftData.NFTname,
            createNftData.symbol,
            ipfs.toString(),
            await web3js.utils.toWei(createNftData.max_supply, 'ether'),
            createNftData.publicPrice,
            createNftData.initialTokenSupply,
            account
        ).send({ from: account })

        // Get the latest contract address after creation
        const userContracts = await nftFactoryContract.methods.getUserContracts(account).call();
        const latest = userContracts.length > 0 ? userContracts[userContracts.length - 1] : '';
        setLoadingMessage("yayyyyy congrats on minting your first ERC404 NFT 🔥");
        setContractAddress(latest);
        setLoading(false);
        console.log(userContracts, latest);
    };
    return (    
    <Box sx={{ justifyContent: "center", alignContent: "center", textAlign: "center" }}>
       {contractAddress && <Confetti/>}

        <Stack sx={{ height: '80vh' }} alignItems="center" justifyContent="center">
        <Typography variant="overline" fontSize={20} sx={{padding: 5}} >Create your own ERC404 NFT now!</Typography>

            <Container maxWidth="lg">
                <Grid container spacing={1}>
                    <Grid item xs={5}>
                        <Box sx={{ height: '30rem', width: '30rem', border: '1px dashed grey', borderRadius: 3, position: 'relative' }} display="flex" flexDirection="column" justifyContent="center">
                         
                           {image && <IconButton onClick={()=> setImage(null)} sx={{ position: 'absolute', top: 0, right: 0 }}>
                                    <DeleteIcon />
                                </IconButton>}
                               
                            
                            {!image && <Button component="label"
                                role={undefined}
                                variant="text"
                                tabIndex={-1}
                                startIcon={<CloudUploadIcon />}>
                                Browse file
                                <VisuallyHiddenInput
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageUpload}/>  
                            </Button>}

                            {image && <label htmlFor="image-upload">
                                <Box component="img" src={image ? URL.createObjectURL(image) : ''} sx={{ width: '100%', height: '100%', borderRadius: 3  }} />
                                <VisuallyHiddenInput
                                    id="image-upload"
                                    type="file"
                                    onChange={handleImageUpload}
                                />
                            </label>}
                        </Box>
                    </Grid>

                    <Grid item xs={6}>
                        <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                            <Stack spacing={2} alignItems="center">
                                <Stack spacing={1} alignItems="left">
                                    <Typography variant="p" justifyContent="left"> Name:</Typography>
                                    <TextField
                                        name="NFTname"
                                        value={createNftData.NFTname}
                                        onChange={handleChange}
                                        placeholder='Name your NFT'
                                    />
                                </Stack>
                                <Stack spacing={1} alignItems="left">
                                    <Typography variant="p" justifyContent="left"> Symbol:</Typography>
                                    <TextField
                                        name="symbol"
                                        value={createNftData.symbol}
                                        onChange={handleChange}
                                        placeholder="Symbol"
                                    />
                                </Stack>
                                <Stack spacing={1} alignItems="left">
                                    <Typography variant="p" justifyContent="left"> Max Supply:</Typography>
                                    <TextField
                                        name="max_supply"
                                        value={createNftData.max_supply}
                                        onChange={handleChange}
                                        placeholder="Max Supply"
                                    />
                                </Stack>
                                {connected ? (
                                    loading ? (
                                        <CircularProgress />
                                    ) : (
                                        <React.Fragment>
                                            <Button variant='outlined' onClick={createNFT}>Create NFT</Button>
                                        </React.Fragment>
                                    )
                                ) : (
                                    <Alert severity="error">Wallet not connected</Alert>
                                )}
                                {contractAddress && <Alert severity='success'>Why don't you share with your friends: <a href={`/${contractAddress}`}>Here is link to interact with your NFT</a></Alert>}
                                {loading && <Alert severity="info">{`${loadingMessage}`}</Alert>}

                                <Modal open={contractAddress} onClose={handleClose}>
                                <Box height="100%" display="flex" alignItems="center" justifyContent="center" >
                                    <Container maxWidth="sm" sx={{background: '#fff', border:1, borderRadius: 3}}>
                                    <IconButton onClick={handleClose} color="primary" sx={{ position: 'absolute', top: '5px', right: '5px' }}>
                                    <CloseIcon />
                                    </IconButton>
                                    <Stack spacing={3} sx={{alignItems:"center", justifyContent:"center", padding:5}}>
                                    <Typography variant="h6">NFT Minted Successfully</Typography>
                                    <Box component="img" src={image ? URL.createObjectURL(image) : ''} sx={{ width: '50%', height: '50%', borderRadius: 3, margin: '10px'  }} />
                                    <Box>
                                    <Button onClick={handleShare} variant="outlined" color="primary" style={{ marginTop: '20px' }}>
                                        Share to Twitter
                                    </Button>
                                    </Box>
                                    </Stack>
                                    </Container>
                                </Box>
                            </Modal>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </Stack>
        <Typography variant="overline">Made with ❤️ by <a href='https://metaschool.so/'>Metaschool</a>🔮</Typography>

        </Box>     

    );
}

export default CreateNFT;
