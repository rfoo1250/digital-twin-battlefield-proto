import React, { useState } from "react";
import Army from "@/game/units/Army";
import Weapon from "@/game/units/Weapon";
// import Aircraft from "@/game/units/Aircraft";
// MUI
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@/gui/shared/ui/TextField";
import FeaturePopup from "@/gui/map/FeaturePopup";
import DeleteIcon from "@mui/icons-material/Delete";
import PinDropIcon from "@mui/icons-material/PinDrop";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import Stack from "@mui/material/Stack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import FlightIcon from "@mui/icons-material/Flight";
import TelegramIcon from "@mui/icons-material/Telegram";
import {
  TableContainer,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  ListItemButton,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import { Menu } from "@/gui/shared/ui/MuiComponents";
import { colorPalette } from "@/utils/constants";
import WeaponTable from "@/gui/map/feature/shared/WeaponTable";
import AircraftTable from "@/gui/map/feature/shared/AircraftTable";
import { Radar } from "@mui/icons-material";

/*
Army card:
modified from Ship card.tsx, with removed aircraft from its core
*/

interface ArmyCardProps {
  army: Army;
  sideName: string;
  // handleAddAircraft: (
  //   airbaseId: string,
  //   aircraftClassName: string
  // ) => Aircraft[];
  // handleDeleteAircraft: (
  //   airbaseId: string,
  //   aircraftIds: string[]
  // ) => Aircraft[];
  // handleLaunchAircraft: (
  //   airbaseId: string,
  //   aircraftIds: string[]
  // ) => Aircraft[];
  handleDeleteArmy: (armyId: string) => void;
  handleMoveArmy: (armyId: string) => void;
  handleArmyAttack: (
    armyId: string,
    weaponId: string,
    weaponQuantity: number
  ) => void;
  handleArmyAutoAttack: (aircraftId: string) => void;
  handleTeleportUnit: (unitId: string) => void;
  handleEditArmy: (
    armyId: string,
    armyName: string,
    armyClassName: string,
    armySpeed: number,
    armyCurrentFuel: number,
    armyRange: number
  ) => void;
  handleAddWeapon: (armyId: string, weaponClassName: string) => Weapon[];
  handleDeleteWeapon: (armyId: string, weaponId: string) => Weapon[];
  handleUpdateWeaponQuantity: (
    armyId: string,
    weaponId: string,
    increment: number
  ) => Weapon[];
  handleCloseOnMap: () => void;
  anchorPositionTop: number;
  anchorPositionLeft: number;
}

const tableRowStyle = {
  border: 0,
};

const tableKeyCellStyle = {
  whiteSpace: "nowrap",
  color: "white",
  border: "none",
  p: 0.5,
  typography: "body1",
};

const tableValueCellStyle = {
  wordBreak: "break-word",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 200,
  color: "white",
  border: "none",
  p: 0.5,
  typography: "body1",
};

type CARD_CONTENT_CONTEXT = "default" | "editing" | "weapons";

export default function ArmyCard(props: Readonly<ArmyCardProps>) {
  const [cardContentContext, setCardContentContext] =
    useState<CARD_CONTENT_CONTEXT>("default");
  const [tempEditData, setTempEditData] = useState({
    name: props.army.name,
    className: props.army.className,
    speed: props.army.speed,
    currentFuel: props.army.currentFuel,
    range: props.army.range,
  });
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // const [aircraftCount, setAircraftCount] = useState(
  //   props.army.aircraft.length
  // );

  const _handleDeleteArmy = () => {
    props.handleCloseOnMap();
    props.handleDeleteArmy(props.army.id);
  };

  const _handleMoveArmy = () => {
    props.handleCloseOnMap();
    props.handleMoveArmy(props.army.id);
  };

  const _handleTeleportArmy = () => {
    props.handleCloseOnMap();
    props.handleTeleportUnit(props.army.id);
  };

  const toggleEdit = () => {
    setCardContentContext(
      cardContentContext !== "editing" ? "editing" : "default"
    );
  };

  const toggleWeapons = () => {
    handleClose();
    setCardContentContext(
      cardContentContext !== "weapons" ? "weapons" : "default"
    );
  };

  // const toggleAircraft = () => {
  //   handleClose();
  //   setCardContentContext(
  //     cardContentContext !== "aircraft" ? "aircraft" : "default"
  //   );
  // };

  const _handleArmyAutoAttack = () => {
    props.handleCloseOnMap();
    props.handleArmyAutoAttack(props.army.id);
  };

  const handleSaveEditedArmy = () => {
    props.handleEditArmy(
      props.army.id,
      tempEditData.name,
      tempEditData.className,
      tempEditData.speed,
      tempEditData.currentFuel,
      tempEditData.range
    );
    toggleEdit();
  };

  const _handleTextFieldChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    switch (event.target.id) {
      case "army-name-text-field": {
        setTempEditData({ ...tempEditData, name: event.target.value });
        break;
      }
      case "army-type-text-field": {
        setTempEditData({ ...tempEditData, className: event.target.value });
        break;
      }
      case "army-speed-text-field": {
        const newSpeed = parseInt(event.target.value);
        if (newSpeed) setTempEditData({ ...tempEditData, speed: newSpeed });
        break;
      }
      case "army-current-fuel-text-field": {
        const newFuel = parseInt(event.target.value);
        if (newFuel) setTempEditData({ ...tempEditData, currentFuel: newFuel });
        break;
      }
      case "army-range-text-field": {
        const newRange = parseInt(event.target.value);
        if (newRange) setTempEditData({ ...tempEditData, range: newRange });
        break;
      }
      case "default": {
        break;
      }
    }
  };

  const armyDataContent = (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        maxWidth: 600,
        minWidth: 350,
        backgroundColor: "transparent",
        boxShadow: "none",
      }}
    >
      <Table size="small" aria-label="aircraft-feature-table">
        <TableBody>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              Coordinates:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.army.latitude.toFixed(2)},{" "}
              {props.army.longitude.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              Heading:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.army.heading.toFixed(2)}
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              Speed:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.army.speed.toFixed(0)} KTS
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              Detection Range:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.army.range.toFixed(0)} NM
            </TableCell>
          </TableRow>
          <TableRow sx={tableRowStyle}>
            <TableCell component="th" scope="row" sx={tableKeyCellStyle}>
              Fuel:
            </TableCell>
            <TableCell align="right" sx={tableValueCellStyle}>
              {props.army.currentFuel.toFixed(0)} /{" "}
              {props.army.maxFuel.toFixed(0) + " LBS"}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );

  const editingContent = () => {
    const inputStyle = {
      input: {
        color: "white",
      },
    };
    const inputLabelStyle = {
      style: {
        color: "white",
      },
    };
    return (
      <form style={{ width: "100%", maxWidth: 600, minWidth: 350 }}>
        <Stack spacing={1} direction="column" sx={{ pt: 2 }}>
          <TextField
            autoComplete="off"
            id="army-name-text-field"
            label="Name"
            defaultValue={props.army.name}
            onChange={_handleTextFieldChange}
            sx={inputStyle}
            slotProps={{
              inputLabel: {
                ...inputLabelStyle,
              },
            }}
          />
          <TextField
            autoComplete="off"
            id="army-type-text-field"
            label="Type"
            defaultValue={props.army.className}
            onChange={_handleTextFieldChange}
            sx={inputStyle}
            slotProps={{
              inputLabel: {
                ...inputLabelStyle,
              },
            }}
          />
          <TextField
            autoComplete="off"
            id="army-speed-text-field"
            label="Speed"
            defaultValue={props.army.speed.toFixed(0)}
            onChange={_handleTextFieldChange}
            sx={inputStyle}
            slotProps={{
              inputLabel: {
                ...inputLabelStyle,
              },
            }}
          />
          <TextField
            autoComplete="off"
            id="army-current-fuel-text-field"
            label="Current Fuel"
            defaultValue={props.army.currentFuel.toFixed(0)}
            onChange={_handleTextFieldChange}
            sx={inputStyle}
            slotProps={{
              inputLabel: {
                ...inputLabelStyle,
              },
            }}
          />
          <TextField
            autoComplete="off"
            id="army-range-text-field"
            label="Range"
            defaultValue={props.army.range}
            onChange={_handleTextFieldChange}
            sx={inputStyle}
            slotProps={{
              inputLabel: {
                ...inputLabelStyle,
              },
            }}
          />
        </Stack>
      </form>
    );
  };

  const defaultCardActions = (
    <Stack spacing={0.5} direction="column" onMouseLeave={handleClose}>
      <ListItemButton onClick={_handleMoveArmy}>
        <PinDropIcon
          sx={{
            mr: 0.5,
          }}
        />
        Plot Course
      </ListItemButton>
      <ListItemButton onClick={_handleArmyAutoAttack}>
        <RocketLaunchIcon sx={{ mr: 0.5 }} /> Auto Attack
      </ListItemButton>
      <ListItemButton onClick={toggleWeapons}>
        <Radar sx={{ mr: 0.5 }} /> Manual Attack
      </ListItemButton>
      <ListItemButton onClick={_handleTeleportArmy}>
        <TelegramIcon sx={{ mr: 0.5 }} /> Edit Location
      </ListItemButton>
    </Stack>
  );

  const editingCardActions = (
    <Stack direction={"row"} spacing={1} sx={{ p: 1 }}>
      <Button
        fullWidth
        variant="contained"
        size="small"
        onClick={handleSaveEditedArmy}
        startIcon={<SaveIcon />}
      >
        Save
      </Button>
      <Button
        fullWidth
        variant="contained"
        size="small"
        color="error"
        onClick={toggleEdit}
        startIcon={<CancelIcon />}
      >
        Cancel
      </Button>
    </Stack>
  );

  const weaponsCardActions = (
    <Stack direction={"row"} spacing={1} sx={{ p: 1, m: 1 }}>
      <Button
        fullWidth
        variant="outlined"
        size="small"
        sx={{ color: "white", borderColor: "white" }}
        onClick={toggleWeapons}
      >
        Back
      </Button>
    </Stack>
  );

  const armyCard = (
    <Box sx={{ minWidth: 150 }}>
      <Card
        sx={{
          backgroundColor: "#282c34",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "left",
        }}
      >
        <CardHeader
          action={
            <>
              {cardContentContext === "default" && (
                <Stack direction={"row"} spacing={0}>
                  <Tooltip title={`Edit ${props.army.name}`}>
                    <IconButton onClick={toggleEdit}>
                      <EditIcon sx={{ color: "white" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`Delete ${props.army.name}`}>
                    <IconButton onClick={_handleDeleteArmy}>
                      <DeleteIcon sx={{ color: "red" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={`More Actions`}>
                    <Button
                      id="army-feature-actions-button"
                      aria-controls={
                        open ? "army-feature-actions-menu" : undefined
                      }
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={handleClick}
                      variant="outlined"
                      size="small"
                      color="inherit"
                    >
                      Actions
                    </Button>
                  </Tooltip>
                  <Menu
                    id="army-feature-actions-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    slotProps={{
                      root: { sx: { ".MuiList-root": { padding: 0 } } },
                      list: {
                        "aria-labelledby": "army-feature-actions-button",
                      },
                    }}
                  >
                    {defaultCardActions}
                  </Menu>
                </Stack>
              )}
            </>
          }
          title={
            <Typography variant="h6" component="div">
              {props.army.name}
            </Typography>
          }
          subheader={
            <Stack
              direction={"column"}
              spacing={0}
              sx={{ color: colorPalette.lightGray }}
            >
              <Typography variant="caption">
                Type: {props.army.className}
              </Typography>
              <Typography variant="caption">
                Side:{" "}
                <Typography variant="caption" component={"span"}>
                  {props.sideName}
                </Typography>
              </Typography>
            </Stack>
          }
        />
        <Divider
          orientation="horizontal"
          variant="middle"
          flexItem
          sx={{ borderColor: "white", mb: 1 }}
        />
        <CardContent sx={{ pt: 0 }}>
          {cardContentContext === "default" && armyDataContent}
          {cardContentContext === "editing" && editingContent()}
          {cardContentContext === "weapons" && (
            <WeaponTable
              unitWithWeapon={props.army}
              handleAddWeapon={props.handleAddWeapon}
              handleDeleteWeapon={props.handleDeleteWeapon}
              handleUpdateWeaponQuantity={props.handleUpdateWeaponQuantity}
              handleUnitAttack={props.handleArmyAttack}
              handleCloseOnMap={props.handleCloseOnMap}
            />
          )}
        </CardContent>
        {cardContentContext === "editing" && editingCardActions}
        {cardContentContext === "weapons" && weaponsCardActions}
      </Card>
    </Box>
  );

  return (
    <FeaturePopup
      anchorPositionTop={props.anchorPositionTop}
      anchorPositionLeft={props.anchorPositionLeft}
      content={armyCard}
      handleCloseOnMap={props.handleCloseOnMap}
    ></FeaturePopup>
  );
}
