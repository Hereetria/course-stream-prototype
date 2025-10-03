import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  Pagination,
  MenuItem,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import useEntityApi from "../../utils/useEntityApi";
import { Course } from "../../types/types";
import getMyUserId from "../../utils/userIdProvider";
import findConflictsWithDetails from "../../utils/findConflicts";
import { categories } from "../../types/categories";
import getInstructorName from "../../utils/instructorNameProvider";
import { Delete, Info } from "@mui/icons-material";
import isEndTimeBeforeStartTime from "../../utils/isEndTimeBeforeStartTime";

const ITEMS_PER_PAGE = 4;
const daysOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MyTeaching = () => {
  const { listAsync, createAsync, deleteAsync } = useEntityApi("courses");
  const [courses, setCourses] = useState<Course[]>([]);
  const [page, setPage] = useState(1);

  // Form state'leri
  const [form, setForm] = useState({
    title: "",
    category: "",
    instructor: "",
    days: "",
    start: "",
    end: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    const creatorUserId = getMyUserId();
    if (!creatorUserId) {
      setHasConflict(true);
      setConflictMessages([
        "Kullanıcı bilgisi alınamadı. Lütfen tekrar giriş yapın.",
      ]);
      return;
    }

    const enrolledUserIds = ["1"];

    if (isEndTimeBeforeStartTime(form.start, form.end)) {
      setHasConflict(true);
      setConflictMessages(["Bitiş saati, başlangıç saatinden önce olamaz."]);
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      title: form.title,
      categoryId: form.category,
      instructor: getInstructorName() ?? "",
      time: {
        days: form.days,
        start: form.start,
        end: form.end,
      },
      creatorUserId,
      enrolledUserIds,
    };

    try {
      const res = await listAsync();
      const userCourses = res.data.filter(
        (c: Course) => c.creatorUserId === creatorUserId
      );

      const allCourses = [...userCourses, newCourse];
      const conflictMap = findConflictsWithDetails(allCourses);
      const newIndex = allCourses.length - 1;

      if (conflictMap[newIndex]) {
        setHasConflict(true);
        setConflictMessages(conflictMap[newIndex]);
        return;
      }

      setHasConflict(false);
      setConflictMessages([]);

      await createAsync(newCourse);
      const updated = await listAsync();
      const updatedUserCourses = updated.data.filter(
        (c: Course) => c.creatorUserId === creatorUserId
      );
      setCourses(updatedUserCourses);
      setForm({
        title: "",
        category: "",
        instructor: "",
        days: "",
        start: "",
        end: "",
      });
      setPage(1);
    } catch (err) {
      console.error("Kurs eklenemedi", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await listAsync();
      const userCourses = res.data.filter(
        (c: Course) => c.creatorUserId === getMyUserId()
      );
      setCourses(userCourses);
    };

    fetchData();
  }, []);

  const paginated = courses.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  const [hasConflict, setHasConflict] = useState(false);
  const [conflictMessages, setConflictMessages] = useState<string[]>([]);

  return (
    <Box
      sx={{
        p: 4,
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        minHeight: "85vh",
        alignItems: "stretch",
      }}
    >
      {/* Sol: form */}

      <Box
        sx={{
          flex: "1 1 300px",
          maxWidth: "400px",
          p: 3,
          borderRadius: 2,
          boxShadow: 3,
          bgcolor: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
          minHeight: 479,
        }}
      >
        <Typography variant="h6" mb={2}>
          Add New Course
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            size="small"
          />

          <TextField
            select
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            fullWidth
            size="small"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Instructor"
            name="instructor"
            value={getInstructorName()}
            fullWidth
            size="small"
            InputProps={{
              readOnly: true,
            }}
            sx={{
              backgroundColor: "#e0e0e0",
              borderRadius: 1,
            }}
          />

          <TextField
            select
            label="Day"
            name="days"
            value={form.days}
            onChange={handleChange}
            fullWidth
            size="small"
          >
            {daysOptions.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Start Time"
              name="start"
              type="time"
              value={form.start}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
            <TextField
              label="End Time"
              name="end"
              type="time"
              value={form.end}
              onChange={handleChange}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
            />
          </Stack>

          {/* Hatalar - butonun üstünde */}
          {conflictMessages.includes(
            "Bitiş saati, başlangıç saatinden önce olamaz."
          ) && (
            <Alert severity="warning">
              Bitiş saati, başlangıç saatinden önce olamaz.
            </Alert>
          )}

          {hasConflict &&
            conflictMessages.some(
              (msg) => msg !== "Bitiş saati, başlangıç saatinden önce olamaz."
            ) && (
              <Alert severity="error">
                Bu saat aralığında çakışan kurs(lar) var:{" "}
                <strong>
                  {conflictMessages
                    .filter(
                      (msg) =>
                        msg !== "Bitiş saati, başlangıç saatinden önce olamaz."
                    )
                    .join(", ")}
                </strong>
              </Alert>
            )}
        </Stack>

        {/* Buton en altta */}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleAdd}
        >
          Add Course
        </Button>
      </Box>

      {/* Sağ: liste + pagination */}
      <Box
        sx={{
          flex: "2 1 500px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: 400,
        }}
      >
        {/* Liste veya Boş Durum */}
        {paginated.length === 0 ? (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: "center",
              width: "100%",
              borderRadius: 2,
              bgcolor: "#f9f9f9",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Info sx={{ fontSize: 40, color: "primary.main" }} />
            <Typography variant="h6" fontWeight={500}>
              Henüz hiç kursunuz bulunmuyor
            </Typography>
            <Alert severity="info" sx={{ maxWidth: 300 }}>
              Sol taraftan yeni bir kurs ekleyerek başlayabilirsiniz.
            </Alert>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {paginated.map((course) => (
                <Paper
                  key={course.id}
                  elevation={2}
                  sx={{
                    p: 2,
                    minWidth: 250,
                    flex: "1 1 calc(50% - 16px)",
                    borderRadius: 2,
                    bgcolor: "#f5f5f5",
                    position: "relative",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category:{" "}
                    {categories.find(
                      (category) => category.id === course.categoryId
                    )?.name || "Other"}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Instructor: {course.instructor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Time: {course.time.days} – {course.time.start} →{" "}
                    {course.time.end}
                  </Typography>

                  {/* Çöp Kutusu */}
                  <Delete
                    sx={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      color: "red",
                      cursor: "pointer",
                      fontSize: 20,
                    }}
                    onClick={async () => {
                      try {
                        await deleteAsync(course.id);
                        const res = await listAsync();
                        const updatedUserCourses = res.data.filter(
                          (c: Course) => c.creatorUserId === getMyUserId()
                        );
                        setCourses(updatedUserCourses);
                      } catch (err) {
                        console.error("Silme işlemi başarısız:", err);
                      }
                    }}
                  />
                </Paper>
              ))}
            </Box>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default MyTeaching;
