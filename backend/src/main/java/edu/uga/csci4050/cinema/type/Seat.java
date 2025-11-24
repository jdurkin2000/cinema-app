package edu.uga.csci4050.cinema.type;

public class Seat {
    private String seatId;
    private String row;
    private int number;
    private SeatStatus status;

    public Seat() {
        this.seatId = "-1";
        this.row = "";
        this.number = -1;
        this.status = SeatStatus.AVAILABLE;
    }

    public Seat(String seatId, String row, int number, SeatStatus status) {
        this.seatId = seatId;
        this.row = row;
        this.number = number;
        this.status = status;
    }

    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public String getRow() {
        return row;
    }

    public void setRow(String row) {
        this.row = row;
    }

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
    }

    public SeatStatus getStatus() {
        return status;
    }

    public void setStatus(SeatStatus status) {
        this.status = status;
    }
}
