import React from 'react';
import { useWeb3 } from './ConnectWallet';
import { Link } from 'react-router-dom';
import {Button, Stack, Typography, Box, Grid} from '@mui/material';

function Navigation() {
  const { account, connectWallet, disconnectWallet } = useWeb3();

  return (
    <Box sx={{ flexGrow: 1, padding: '16px', border: 1 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                    <Typography variant="h6" sx={{ color: '#333' }}>SHARD0x</Typography>
                </Grid>
                <Grid item xs={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <Link to="/" style={{ textDecoration: 'none', color: '#333', padding: '8px', display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}>
                                <Typography variant="body1">Home</Typography>
                            </Link>
                            <Link to="/create-nft" style={{ textDecoration: 'none', color: '#333', padding: '8px', display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}>
                                <Typography variant="body1">Create NFT</Typography>
                            </Link>
                            <Link to="/list-nft" style={{ textDecoration: 'none', color: '#333', padding: '8px', display: 'inline-block', '&:hover': { textDecoration: 'underline' } }}>
                                <Typography variant="body1">List NFT</Typography>
                            </Link>
                    </Box>
                </Grid>
                <Grid item xs={5} container justifyContent="flex-end">
                    {account ? (
                        <Button variant="outlined" onClick={disconnectWallet} color="success">
                            Disconnect Wallet
                        </Button>
                    ) : (
                        <Button variant="outlined" onClick={connectWallet} color="error">
                            Connect Wallet
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default Navigation;
